import asyncHandler from 'express-async-handler';
import Support from '../models/supportModel.js';
import Case from '../models/caseModel.js';
import User from '../models/userModel.js';
import { io } from '../server.js';

// @desc    Create support for a case
// @route   POST /api/cases/:id/support
// @access  Private
const createSupport = asyncHandler(async (req, res) => {
  const { amount, message, anonymous, paymentMethod, transactionId } = req.body;
  const caseId = req.params.id;

  // Check if case exists
  const caseItem = await Case.findById(caseId);
  if (!caseItem) {
    res.status(404);
    throw new Error('Hoàn cảnh không tồn tại');
  }

  // Validate amount
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Số tiền ủng hộ không hợp lệ');
  }

  // Create support record
  const support = await Support.create({
    user: req.user._id,
    case: caseId,
    amount,
    message: message || '',
    anonymous: anonymous || false,
    paymentMethod,
    transactionId: transactionId || '',
    status: 'completed', // Assuming payment is already verified
  });

  if (support) {
    // Update case's current amount and support count
    caseItem.currentAmount += amount;
    caseItem.supportCount += 1;
    await caseItem.save();
    
    // Emit socket event for real-time updates
    io.to(`case_${caseId}`).emit('new_support', {
      _id: support._id,
      amount,
      message,
      createdAt: support.createdAt,
      user: anonymous
        ? { name: 'Ẩn danh', avatar: null }
        : {
            _id: req.user._id,
            name: req.user.name,
            avatar: req.user.avatar,
          },
    });

    res.status(201).json(support);
  } else {
    res.status(400);
    throw new Error('Không thể tạo ủng hộ');
  }
});

// @desc    Get user's supports
// @route   GET /api/supports/my-supports
// @access  Private
const getUserSupports = asyncHandler(async (req, res) => {
  const supports = await Support.find({ user: req.user._id })
    .populate('case', 'title images')
    .sort({ createdAt: -1 });

  res.json(supports);
});

// @desc    Get all supports (admin only)
// @route   GET /api/supports
// @access  Private/Admin
const getAllSupports = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const count = await Support.countDocuments({});
  const supports = await Support.find({})
    .populate('user', 'name email')
    .populate('case', 'title')
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
  const timeFilter = req.query.timeFilter || 'all';
  
  let dateFilter = {};
  
  // Apply time filter
  if (timeFilter === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter = { createdAt: { $gte: weekAgo } };
  } else if (timeFilter === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter = { createdAt: { $gte: monthAgo } };
  }
  
  const topSupporters = await Support.aggregate([
    { $match: { status: 'completed', anonymous: false, ...dateFilter } },
    {
      $group: {
        _id: '$user',
        totalAmount: { $sum: '$amount' },
        supportCount: { $sum: 1 },
      },
    },
    { $sort: { totalAmount: -1 } },
    { $limit: 20 },
  ]);
  
  // Populate user details
  const populatedSupporters = await Promise.all(
    topSupporters.map(async (supporter) => {
      const user = await User.findById(supporter._id).select('name avatar');
      return {
        _id: supporter._id,
        userId: supporter._id,
        userName: user ? user.name : 'Unknown User',
        userAvatar: user ? user.avatar : null,
        totalAmount: supporter.totalAmount,
        supportCount: supporter.supportCount,
      };
    })
  );

  res.json(populatedSupporters);
});

export { createSupport, getUserSupports, getAllSupports, getTopSupporters };