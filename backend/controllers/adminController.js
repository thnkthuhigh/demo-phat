import asyncHandler from 'express-async-handler';
import Case from '../models/caseModel.js';
import User from '../models/userModel.js';
import Support from '../models/supportModel.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total users
  const userCount = await User.countDocuments();

  // Get case stats
  const caseStats = await Case.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Format case stats
  const caseStatusCounts = {
    active: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  };

  caseStats.forEach((stat) => {
    caseStatusCounts[stat._id] = stat.count;
  });

  // Get support stats
  const supportStats = await Support.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Get monthly support data for chart
  const date = new Date();
  date.setMonth(date.getMonth() - 11); // Last 12 months

  const monthlySupportData = await Support.aggregate([
    {
      $match: {
        createdAt: { $gte: date },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    userCount,
    caseStatusCounts,
    totalDonations: supportStats[0]?.totalAmount || 0,
    donationCount: supportStats[0]?.count || 0,
    monthlySupportData,
  });
});

// @desc    Get pending cases
// @route   GET /api/admin/cases/pending
// @access  Private/Admin
const getPendingCases = asyncHandler(async (req, res) => {
  const pendingCases = await Case.find({ status: 'pending' })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json(pendingCases);
});

// @desc    Approve case
// @route   PUT /api/admin/cases/:id/approve
// @access  Private/Admin
const approveCase = asyncHandler(async (req, res) => {
  const caseItem = await Case.findById(req.params.id);

  if (caseItem) {
    caseItem.status = 'active';
    const updatedCase = await caseItem.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy hoàn cảnh');
  }
});

// @desc    Reject case
// @route   PUT /api/admin/cases/:id/reject
// @access  Private/Admin
const rejectCase = asyncHandler(async (req, res) => {
  const caseItem = await Case.findById(req.params.id);

  if (caseItem) {
    caseItem.status = 'cancelled';
    const updatedCase = await caseItem.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy hoàn cảnh');
  }
});

// @desc    Featured toggle
// @route   PUT /api/admin/cases/:id/featured
// @access  Private/Admin
const toggleFeatured = asyncHandler(async (req, res) => {
  const caseItem = await Case.findById(req.params.id);

  if (caseItem) {
    caseItem.featured = !caseItem.featured;
    const updatedCase = await caseItem.save();
    res.json(updatedCase);
  } else {
    res.status(404);
    throw new Error('Không tìm thấy hoàn cảnh');
  }
});

export {
  getDashboardStats,
  getPendingCases,
  approveCase,
  rejectCase,
  toggleFeatured,
};