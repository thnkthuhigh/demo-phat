import mongoose from 'mongoose';

const supportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Case',
    },
    amount: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['bank_transfer', 'credit_card', 'momo', 'zalopay', 'other'],
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Support = mongoose.model('Support', supportSchema);

export default Support;