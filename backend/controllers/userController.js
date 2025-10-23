import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Support from "../models/supportModel.js";
import Case from "../models/caseModel.js";
import mongoose from "mongoose";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      bankAccount: user.bankAccount,
      bankName: user.bankName,
      socialLinks: user.socialLinks,
      bio: user.bio,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Đảm bảo avatar là string
    if (req.body.avatar) {
      user.avatar = Array.isArray(req.body.avatar)
        ? req.body.avatar[0]
        : req.body.avatar;
    }

    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.gender = req.body.gender || user.gender;
    user.bankAccount = req.body.bankAccount || user.bankAccount;
    user.bankName = req.body.bankName || user.bankName;

    // Update social links
    user.socialLinks = {
      facebook:
        req.body.socialLinks?.facebook || user.socialLinks?.facebook || "",
      twitter: req.body.socialLinks?.twitter || user.socialLinks?.twitter || "",
      instagram:
        req.body.socialLinks?.instagram || user.socialLinks?.instagram || "",
    };

    user.bio = req.body.bio || user.bio;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      phone: updatedUser.phone,
      address: updatedUser.address,
      gender: updatedUser.gender,
      bankAccount: updatedUser.bankAccount,
      bankName: updatedUser.bankName,
      socialLinks: updatedUser.socialLinks,
      bio: updatedUser.bio,
      isAdmin: updatedUser.isAdmin,
      token: req.body.token,
    });
  } else {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    // Get user's total support amount and count
    const supportData = await Support.aggregate([
      { $match: { user: user._id, status: "completed" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const userData = {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      socialLinks: user.socialLinks,
      totalSupported: supportData[0]?.totalAmount || 0,
      supportCount: supportData[0]?.count || 0,
      createdAt: user.createdAt,
    };

    res.json(userData);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Thêm function mới để lấy thông tin chi tiết của người dùng
const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm user theo ID
    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("Không tìm thấy người dùng");
    }

    // Lấy thêm thống kê về số lần ủng hộ và tổng tiền
    const supportStats = await Support.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(id),
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          supportCount: { $count: {} },
        },
      },
    ]);

    // Kết hợp thông tin user với thống kê
    const userDetails = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      gender: user.gender,
      address: user.address,
      bio: user.bio,
      bankName: user.bankName,
      bankAccount: user.bankAccount,
      socialLinks: user.socialLinks || {},
      createdAt: user.createdAt,
      isAdmin: user.isAdmin,
      totalSupported: supportStats[0]?.totalAmount || 0,
      supportCount: supportStats[0]?.supportCount || 0,
    };

    res.json(userDetails);
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500);
    throw new Error("Lỗi khi lấy thông tin người dùng");
  }
});

export { getUserProfile, updateUserProfile, getUserById, getUserDetails };

// Public: Get supports by user id (completed only)
export const getUserSupportsPublic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const supports = await Support.find({
    user: id,
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .populate("case", "title situationImages");

  const data = supports.map((s) => ({
    _id: s._id,
    amount: s.amount,
    message: s.message,
    items: s.items || [], // Include items for item-based support
    createdAt: s.createdAt,
    case: s.case
      ? { _id: s.case._id, title: s.case.title, image: s.case.situationImages?.[0] || null }
      : null,
  }));

  res.json(data);
});

// Public: Get cases created by user (active only)
export const getUserCasesPublic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cases = await Case.find({ user: id, status: "active" })
    .sort({ createdAt: -1 })
    .select("title targetAmount currentAmount situationImages createdAt supportType neededItems");

  // Map để trả về dữ liệu với tên field chuẩn
  const data = cases.map(c => ({
    _id: c._id,
    title: c.title,
    targetAmount: c.targetAmount,
    raisedAmount: c.currentAmount, // Map currentAmount -> raisedAmount cho frontend
    situationImages: c.situationImages,
    createdAt: c.createdAt,
    supportType: c.supportType,
    neededItems: c.neededItems,
  }));

  res.json(data);
});
