import asyncHandler from "express-async-handler";
import Case from "../models/caseModel.js";
import Support from "../models/supportModel.js";
import User from "../models/userModel.js";

// @desc    Get pending cases
// @route   GET /api/admin/cases/pending
// @access  Private/Admin
const getPendingCases = asyncHandler(async (req, res) => {
  console.log("Fetching pending cases...");

  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  // Ensure we're using the correct status value
  const pendingFilter = { status: "pending" };

  // Log the query we're using
  console.log("Query filter:", pendingFilter);

  const count = await Case.countDocuments(pendingFilter);
  console.log("Found pending cases count:", count);

  const pendingCases = await Case.find(pendingFilter)
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  console.log("Pending cases fetched:", pendingCases.length);

  res.json({
    cases: pendingCases,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Approve a pending case
// @route   PUT /api/admin/cases/:id/approve
// @access  Private/Admin
const approveCase = asyncHandler(async (req, res) => {
  const caseToApprove = await Case.findById(req.params.id);

  if (caseToApprove) {
    if (caseToApprove.status !== "pending") {
      res.status(400);
      throw new Error("Hoàn cảnh này không ở trạng thái chờ duyệt");
    }

    caseToApprove.status = "active";

    const updatedCase = await caseToApprove.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy hoàn cảnh");
  }
});

// @desc    Reject a pending case
// @route   PUT /api/admin/cases/:id/reject
// @access  Private/Admin
const rejectCase = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const caseToReject = await Case.findById(req.params.id);

  if (caseToReject) {
    if (caseToReject.status !== "pending") {
      res.status(400);
      throw new Error("Hoàn cảnh này không ở trạng thái chờ duyệt");
    }

    caseToReject.status = "cancelled";
    caseToReject.rejectionReason = reason || "Không đủ điều kiện";

    const updatedCase = await caseToReject.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy hoàn cảnh");
  }
});

// @desc    Toggle featured status for a case
// @route   PUT /api/admin/cases/:id/toggle-featured
// @access  Private/Admin
const toggleFeatured = asyncHandler(async (req, res) => {
  const caseToUpdate = await Case.findById(req.params.id);

  if (caseToUpdate) {
    caseToUpdate.featured = !caseToUpdate.featured;

    const updatedCase = await caseToUpdate.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy hoàn cảnh");
  }
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const { timeFilter } = req.query;
  let dateFilter = {};

  // Áp dụng bộ lọc thời gian
  if (timeFilter && timeFilter !== "all") {
    const now = new Date();
    let startDate;

    switch (timeFilter) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = null;
    }

    if (startDate) {
      dateFilter = { createdAt: { $gte: startDate } };
    }
  }

  // Lấy tổng số người dùng
  const userCount = await User.countDocuments();

  // Lấy thống kê hoàn cảnh
  const caseStats = await Case.aggregate([
    {
      $match: dateFilter,
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Định dạng thống kê hoàn cảnh
  const caseStatusCounts = {
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  caseStats.forEach((stat) => {
    caseStatusCounts[stat._id] = stat.count;
  });

  // Lấy thống kê ủng hộ
  const supportStats = await Support.aggregate([
    {
      $match: {
        ...dateFilter,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  // Lấy dữ liệu ủng hộ theo tháng cho biểu đồ
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - 6); // 6 tháng gần nhất

  const monthlySupportData = await Support.aggregate([
    {
      $match: {
        createdAt: { $gte: monthsAgo },
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Chuyển đổi định dạng dữ liệu cho dễ sử dụng ở frontend
  const formattedMonthlySupportData = monthlySupportData.map((item) => {
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    const monthName = monthNames[item._id.month - 1];
    return {
      label: `${monthName}/${item._id.year}`,
      total: item.total,
      count: item.count,
    };
  });

  res.json({
    userCount,
    caseStatusCounts,
    totalDonations: supportStats[0]?.totalAmount || 0,
    donationCount: supportStats[0]?.count || 0,
    monthlySupportData: formattedMonthlySupportData,
  });
});

export {
  getDashboardStats,
  getPendingCases,
  approveCase,
  rejectCase,
  toggleFeatured,
};