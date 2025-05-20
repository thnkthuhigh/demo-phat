import mongoose from "mongoose";

const caseSchema = mongoose.Schema(
  {
    // Các trường hiện tại
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "medical",
        "education",
        "disaster",
        "animal",
        "environmental",
        "community",
        "other",
      ],
    },
    supportType: {
      type: String,
      required: true,
      enum: ["money", "items", "both"],
      default: "money",
    },
    // Cập nhật cấu trúc neededItems để hỗ trợ nhiều vật phẩm
    neededItems: [
      {
        name: { type: String },
        quantity: { type: Number, default: 1 },
        receivedQuantity: { type: Number, default: 0 },
        unit: { type: String, default: "cái" }, // Đơn vị đo
      },
    ],
    situationImages: [String],
    proofImages: [String],
    targetAmount: {
      type: Number,
      default: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    supportCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    updates: [
      {
        content: String,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    location: String,
    contactInfo: String,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

// Thêm phương thức tính toán progress dựa theo supportType
caseSchema.methods.calculateProgress = function () {
  if (this.supportType === "money" || this.supportType === "both") {
    if (this.targetAmount > 0) {
      return Math.min(
        Math.round((this.currentAmount / this.targetAmount) * 100),
        100
      );
    }
    return 0;
  } else if (this.supportType === "items") {
    if (this.neededItems && this.neededItems.length > 0) {
      const totalProgress = this.neededItems.reduce((acc, item) => {
        const itemProgress =
          item.quantity > 0 ? Math.min(item.receivedQuantity / item.quantity, 1) : 0;
        return acc + itemProgress;
      }, 0);

      return Math.min(
        Math.round((totalProgress / this.neededItems.length) * 100),
        100
      );
    }
    return 0;
  }
  return 0;
};

const Case = mongoose.model("Case", caseSchema);

export default Case;
