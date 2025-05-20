import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Support from "../models/supportModel.js";

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

export { getUserProfile, updateUserProfile, getUserById };
