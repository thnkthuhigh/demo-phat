import asyncHandler from "express-async-handler";
import Support from "../models/supportModel.js";
import Case from "../models/caseModel.js";
import User from "../models/userModel.js";
import { io } from "../server.js";
import mongoose from "mongoose";

// @desc    Create support for a case
// @route   POST /api/cases/:id/support
// @access  Private
const createSupport = asyncHandler(async (req, res) => {
  const { amount, items, message, anonymous, paymentMethod, transactionId } =
    req.body;
  const caseId = req.params.id;

  // Check if case exists
  const caseItem = await Case.findById(caseId);
  if (!caseItem) {
    res.status(404);
    throw new Error("Hoàn cảnh không tồn tại");
  }

  // Validate based on support type
  const isSupportingMoney =
    caseItem.supportType === "money" || caseItem.supportType === "both";
  const isSupportingItems =
    caseItem.supportType === "items" || caseItem.supportType === "both";

  // Kiểm tra nếu không có tiền và không có vật phẩm
  if ((!amount || amount <= 0) && (!items || items.length === 0)) {
    res.status(400);
    throw new Error("Vui lòng ủng hộ tiền hoặc vật phẩm");
  }

  // Kiểm tra loại hỗ trợ phù hợp
  if (!isSupportingMoney && amount && amount > 0) {
    res.status(400);
    throw new Error("Hoàn cảnh này không nhận hỗ trợ tiền");
  }

  if (!isSupportingItems && items && items.length > 0) {
    res.status(400);
    throw new Error("Hoàn cảnh này không nhận hỗ trợ vật phẩm");
  }

  // Kiểm tra vật phẩm hỗ trợ có hợp lệ không
  if (items && items.length > 0) {
    for (const item of items) {
      // Tìm vật phẩm trong danh sách cần hỗ trợ
      const neededItem = caseItem.neededItems.find(
        (neededItem) => neededItem._id.toString() === item.itemId.toString()
      );

      if (!neededItem) {
        res.status(400);
        throw new Error(`Vật phẩm ${item.name} không tồn tại trong yêu cầu`);
      }

      // Kiểm tra số lượng
      const remainingQuantity =
        neededItem.quantity - neededItem.receivedQuantity;
      if (item.quantity > remainingQuantity) {
        res.status(400);
        throw new Error(
          `Số lượng vật phẩm ${item.name} vượt quá số lượng còn thiếu (${remainingQuantity} ${neededItem.unit})`
        );
      }
    }
  }

  // Create support record
  const support = await Support.create({
    user: req.user._id,
    case: caseId,
    amount: amount || 0,
    items: items || [],
    message: message || "",
    anonymous: anonymous || false,
    paymentMethod,
    transactionId: transactionId || "",
    status: "pending", // Chuyển thành pending để chờ admin duyệt
  });

  if (support) {
    // Thông báo có khoản ủng hộ mới cần duyệt thông qua socket
    io.to(`admin_notifications`).emit("new_support_pending", {
      _id: support._id,
      amount: amount || 0,
      hasItems: items && items.length > 0,
      caseName: caseItem.title,
      caseId: caseItem._id,
      createdAt: support.createdAt,
    });

    res.status(201).json(support);
  } else {
    res.status(400);
    throw new Error("Không thể tạo ủng hộ");
  }
});

// @desc    Get user's supports
// @route   GET /api/supports/my-supports
// @access  Private
const getUserSupports = asyncHandler(async (req, res) => {
  const supports = await Support.find({ user: req.user._id })
    .populate("case", "title images")
    .sort({ createdAt: -1 });

  res.json(supports);
});

// @desc    Get all supports (admin only)
// @route   GET /api/supports
// @access  Private/Admin
const getAllSupports = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;
  const status = req.query.status;
  const countOnly = req.query.countOnly === "true";

  // Xây dựng query filter
  let query = {};

  // Nếu có filter trạng thái
  if (status && status !== "all") {
    query.status = status;
  }

  // Nếu chỉ cần đếm số lượng
  if (countOnly) {
    const count = await Support.countDocuments(query);
    return res.json({ count });
  }

  const count = await Support.countDocuments(query);
  const supports = await Support.find(query)
    .populate("user", "name email avatar")
    .populate("case", "title images")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    supports,
    page,
    pages: Math.ceil(count / pageSize),
    totalCount: count,
  });
});

// @desc    Get top supporters
// @route   GET /api/supports/top-supporters
// @access  Public
const getTopSupporters = asyncHandler(async (req, res) => {
  const timeFilter = req.query.timeFilter || "all";

  // Ghi log để debug
  console.log(`Getting top supporters with filter: ${timeFilter}`);

  // Tạo điều kiện lọc theo thời gian
  let timeCondition = {};

  if (timeFilter === "week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    timeCondition = { createdAt: { $gte: oneWeekAgo } };
  } else if (timeFilter === "month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    timeCondition = { createdAt: { $gte: oneMonthAgo } };
  }

  // Đảm bảo chỉ lấy các giao dịch đã hoàn thành
  const matchCondition = {
    ...timeCondition,
    status: "completed",
  };

  try {
    // Thêm thời gian hiện tại để đảm bảo aggregate không bị cache
    console.log(`Aggregating supporters at ${new Date().toISOString()}`);

    const supporters = await Support.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$user",
          totalAmount: { $sum: "$amount" },
          supportCount: { $sum: 1 },
          lastSupport: { $max: "$createdAt" }, // Thêm thời gian hỗ trợ gần nhất
        },
      },
      {
        $sort: { totalAmount: -1, supportCount: -1, lastSupport: -1 }, // Sắp xếp theo nhiều tiêu chí
      },
      {
        $limit: 50, // Lấy top 50
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 1,
          userId: "$_id",
          userName: "$userInfo.name",
          userAvatar: "$userInfo.avatar",
          totalAmount: 1,
          supportCount: 1,
          lastSupport: 1,
        },
      },
    ]);

    // Thêm thông tin debug
    console.log(`Found ${supporters.length} top supporters`);

    // Đảm bảo response có header không cache
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.json(supporters);
  } catch (error) {
    console.error("Error in getTopSupporters:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách người ủng hộ hàng đầu" });
  }
});

// @desc    Get top supporters for a specific case
// @route   GET /api/cases/:id/top-supporters
// @access  Public
const getTopSupportersForCase = asyncHandler(async (req, res) => {
  const caseId = req.params.id;

  // Verify case exists
  const caseExists = await Case.findById(caseId);
  if (!caseExists) {
    res.status(404);
    throw new Error("Hoàn cảnh không tồn tại");
  }

  const topSupporters = await Support.aggregate([
    {
      $match: {
        case: mongoose.Types.ObjectId(caseId),
        status: "completed",
        anonymous: false,
      },
    },
    {
      $group: {
        _id: "$user",
        totalAmount: { $sum: "$amount" },
        supportCount: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 10 },
  ]);

  // Populate user details
  const populatedSupporters = await Promise.all(
    topSupporters.map(async (supporter) => {
      const user = await User.findById(supporter._id).select("name avatar");
      return {
        _id: `${supporter._id}_${caseId}`, // Unique identifier
        userId: supporter._id,
        userName: user ? user.name : "Unknown User",
        userAvatar: user ? user.avatar : null,
        totalAmount: supporter.totalAmount,
        supportCount: supporter.supportCount,
      };
    })
  );

  res.json(populatedSupporters);
});

// @desc    Update support status
// @route   PUT /api/supports/:id/status
// @access  Private/Admin
const updateSupportStatus = asyncHandler(async (req, res) => {
  const support = await Support.findById(req.params.id);

  if (!support) {
    res.status(404);
    throw new Error("Không tìm thấy giao dịch ủng hộ");
  }

  const { status, note } = req.body;

  if (!["pending", "completed", "failed"].includes(status)) {
    res.status(400);
    throw new Error("Trạng thái không hợp lệ");
  }

  const prevStatus = support.status;
  support.status = status;

  // Thêm ghi chú nếu có
  if (note) {
    support.adminNote = note;
  }

  // Thêm vào lịch sử cập nhật trạng thái
  support.statusHistory = support.statusHistory || [];
  support.statusHistory.push({
    status,
    updatedBy: req.user._id,
    updatedAt: Date.now(),
    note: note || "",
  });

  // Nếu thay đổi từ trạng thái khác sang 'completed' hoặc từ 'completed' sang trạng thái khác
  // thì cần phải cập nhật số tiền ủng hộ trong case
  if (prevStatus !== "completed" && status === "completed") {
    const caseToUpdate = await Case.findById(support.case);

    if (caseToUpdate) {
      // Cập nhật số tiền nếu có
      if (support.amount > 0) {
        caseToUpdate.currentAmount += support.amount;
        caseToUpdate.supportCount += 1;
      }

      // Cập nhật số lượng vật phẩm đã nhận nếu có
      if (support.items && support.items.length > 0) {
        for (const supportItem of support.items) {
          const neededItemIndex = caseToUpdate.neededItems.findIndex(
            (item) => item._id.toString() === supportItem.itemId.toString()
          );

          if (neededItemIndex !== -1) {
            caseToUpdate.neededItems[neededItemIndex].receivedQuantity +=
              supportItem.quantity;
          }
        }
      }

      await caseToUpdate.save();

      // Gửi thông báo cập nhật tiến độ qua socket.io
      io.to(`case_${caseToUpdate._id}`).emit("progress_update", {
        currentAmount: caseToUpdate.currentAmount,
        supportCount: caseToUpdate.supportCount,
        percentage: Math.min(
          Math.round(
            (caseToUpdate.currentAmount / caseToUpdate.targetAmount) * 100
          ),
          100
        ),
        neededItems: caseToUpdate.neededItems,
      });
    }
  } else if (prevStatus === "completed" && status !== "completed") {
    // Giảm số tiền và vật phẩm khi hủy ủng hộ đã duyệt
    const caseToUpdate = await Case.findById(support.case);

    if (caseToUpdate) {
      // Giảm số tiền nếu có
      if (support.amount > 0) {
        caseToUpdate.currentAmount = Math.max(
          0,
          caseToUpdate.currentAmount - support.amount
        );
        caseToUpdate.supportCount = Math.max(0, caseToUpdate.supportCount - 1);
      }

      // Giảm số lượng vật phẩm đã nhận nếu có
      if (support.items && support.items.length > 0) {
        for (const supportItem of support.items) {
          const neededItemIndex = caseToUpdate.neededItems.findIndex(
            (item) => item._id.toString() === supportItem.itemId.toString()
          );

          if (neededItemIndex !== -1) {
            caseToUpdate.neededItems[neededItemIndex].receivedQuantity =
              Math.max(
                0,
                caseToUpdate.neededItems[neededItemIndex].receivedQuantity -
                  supportItem.quantity
              );
          }
        }
      }

      await caseToUpdate.save();

      // Gửi thông báo cập nhật tiến độ qua socket.io
      io.to(`case_${caseToUpdate._id}`).emit("progress_update", {
        currentAmount: caseToUpdate.currentAmount,
        supportCount: caseToUpdate.supportCount,
        percentage: Math.min(
          Math.round(
            (caseToUpdate.currentAmount / caseToUpdate.targetAmount) * 100
          ),
          100
        ),
        neededItems: caseToUpdate.neededItems,
      });
    }
  }

  const updatedSupport = await support.save();

  // Gửi thông báo cho người dùng qua socket.io
  if (support.user) {
    io.to(`user_${support.user}`).emit("support_status_update", {
      supportId: support._id,
      status: support.status,
      message:
        status === "completed"
          ? "Khoản ủng hộ của bạn đã được duyệt"
          : "Khoản ủng hộ của bạn đã bị từ chối",
      note: note || "",
    });
  }

  res.json(updatedSupport);
});

export {
  createSupport,
  getUserSupports,
  getAllSupports,
  getTopSupporters,
  getTopSupportersForCase,
  updateSupportStatus,
};
