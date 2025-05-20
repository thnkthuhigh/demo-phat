import mongoose from "mongoose";

const itemSchema = mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    required: true,
  },
});

const statusHistorySchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const supportSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    case: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Case",
    },
    amount: {
      type: Number,
      default: 0,
    },
    items: [itemSchema],
    message: {
      type: String,
      default: "",
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
    paymentMethod: {
      type: String,
      enum: ["transfer", "momo", "cash", "other"],
      default: "transfer",
    },
    transactionId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: "",
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

const Support = mongoose.model("Support", supportSchema);

export default Support;