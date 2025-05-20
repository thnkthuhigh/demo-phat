import asyncHandler from "express-async-handler";
import Case from "../models/caseModel.js";
import Support from "../models/supportModel.js";
import { io } from "../server.js";

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private
const createCase = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    supportType,
    situationImages,
    proofImages,
    neededItems,
    targetAmount,
    location,
    contactInfo,
    endDate,
  } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (supportType === "items" && !neededItems) {
    res.status(400);
    throw new Error("Vui lòng mô tả vật phẩm cần hỗ trợ");
  }

  if ((supportType === "money" || supportType === "both") && !targetAmount) {
    res.status(400);
    throw new Error("Vui lòng nhập số tiền mục tiêu");
  }

  // Kết hợp hình ảnh thành một đối tượng có cấu trúc
  const images = {
    situation: situationImages || [],
    proof: proofImages || [],
  };

  try {
    const newCase = await Case.create({
      user: req.user._id,
      title,
      description,
      category,
      supportType,
      situationImages: situationImages || [],
      proofImages: proofImages || [],
      neededItems,
      targetAmount: supportType !== "items" ? targetAmount : 0,
      location,
      contactInfo,
      endDate,
      status: "pending", // Mặc định là chờ duyệt
    });

    console.log("New case created with ID:", newCase._id);
    console.log("New case status:", newCase.status);
    console.log("Case object keys:", Object.keys(newCase._doc));

    if (newCase) {
      res.status(201).json(newCase);
    } else {
      res.status(400);
      throw new Error("Dữ liệu không hợp lệ");
    }
  } catch (error) {
    console.error("Error creating case:", error);
    res.status(400);
    throw new Error(`Lỗi khi tạo hoàn cảnh: ${error.message}`);
  }
});

// @desc    Get all cases with pagination and filtering
// @route   GET /api/cases
// @access  Public
const getCases = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
        title: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
    : {};

  const categoryFilter = req.query.category
    ? { category: req.query.category }
    : {};

  const statusFilter = { status: "active" }; // Only show active cases by default

  // Combine all filters
  const filter = {
    ...keyword,
    ...categoryFilter,
    ...statusFilter,
  };

  const count = await Case.countDocuments(filter);
  const cases = await Case.find(filter)
    .populate("user", "name avatar")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    cases,
    page,
    pages: Math.ceil(count / pageSize),
    totalCount: count,
  });
});

// @desc    Get featured cases
// @route   GET /api/cases/featured
// @access  Public
const getFeaturedCases = asyncHandler(async (req, res) => {
  const featuredCases = await Case.find({ featured: true, status: "active" })
    .sort({ createdAt: -1 })
    .limit(6);
  res.json(featuredCases);
});

// @desc    Get case by ID
// @route   GET /api/cases/:id
// @access  Public
const getCaseById = asyncHandler(async (req, res) => {
  const caseItem = await Case.findById(req.params.id).populate(
    "user",
    "name avatar email phone"
  );

  if (caseItem) {
    // Get recent supports for this case
    const recentSupports = await Support.find({
      case: caseItem._id,
      status: "completed",
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedSupports = recentSupports.map((support) => ({
      _id: support._id,
      amount: support.amount,
      message: support.message,
      createdAt: support.createdAt,
      user: support.anonymous
        ? { name: "Ẩn danh", avatar: null }
        : {
            _id: support.user._id,
            name: support.user.name,
            avatar: support.user.avatar,
          },
    }));

    const caseWithSupports = {
      ...caseItem._doc,
      recentSupports: formattedSupports,
    };

    res.json(caseWithSupports);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy hoàn cảnh");
  }
});

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private
const updateCase = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    images,
    targetAmount,
    location,
    contactInfo,
    endDate,
    updates,
  } = req.body;

  const caseItem = await Case.findById(req.params.id);

  if (caseItem) {
    // Check if user owns this case or is admin
    if (
      caseItem.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Không có quyền chỉnh sửa");
    }

    caseItem.title = title || caseItem.title;
    caseItem.description = description || caseItem.description;
    caseItem.category = category || caseItem.category;
    caseItem.images = images || caseItem.images;
    caseItem.targetAmount = targetAmount || caseItem.targetAmount;
    caseItem.location = location || caseItem.location;
    caseItem.contactInfo = contactInfo || caseItem.contactInfo;
    caseItem.endDate = endDate || caseItem.endDate;

    // Add update if provided
    if (updates && updates.length > 0) {
      caseItem.updates = [...caseItem.updates, ...updates];
    }

    const updatedCase = await caseItem.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error("Không tìm thấy hoàn cảnh");
  }
});

// @desc    Delete case
// @route   DELETE /api/cases/:id
// @access  Private
const deleteCase = asyncHandler(async (req, res) => {
  const caseItem = await Case.findById(req.params.id);

  if (caseItem) {
    // Check if user owns this case or is admin
    if (
      caseItem.user.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      res.status(401);
      throw new Error("Không có quyền xóa");
    }

    await caseItem.deleteOne();
    res.json({ message: "Đã xóa hoàn cảnh" });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy hoàn cảnh");
  }
});

// @desc    Get user's cases
// @route   GET /api/cases/my-cases
// @access  Private
const getMyCases = asyncHandler(async (req, res) => {
  const cases = await Case.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(cases);
});

// @desc    Get case statistics
// @route   GET /api/cases/stats
// @access  Public
const getCaseStats = asyncHandler(async (req, res) => {
  const totalCases = await Case.countDocuments({ status: "active" });

  const supportStats = await Support.aggregate([
    { $match: { status: "completed" } },
    {
      $group: {
        _id: null,
        totalDonated: { $sum: "$amount" },
        uniqueDonors: { $addToSet: "$user" },
      },
    },
  ]);

  const stats = {
    totalCases,
    totalDonated: supportStats[0]?.totalDonated || 0,
    totalDonors: supportStats[0]?.uniqueDonors.length || 0,
  };

  res.json(stats);
});

// @desc    Toggle featured status of a case
// @route   PUT /api/cases/:id/feature
// @access  Admin
const toggleCaseFeature = asyncHandler(async (req, res) => {
  const caseItem = await Case.findById(req.params.id);

  if (!caseItem) {
    res.status(404);
    throw new Error("Hoàn cảnh không tồn tại");
  }

  // Toggle the featured status
  caseItem.featured = !caseItem.featured;

  const updatedCase = await caseItem.save();

  res.json(updatedCase);
});

export {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
  getFeaturedCases,
  getMyCases,
  getCaseStats,
  toggleCaseFeature,
};
