import mongoose from "mongoose";

const caseSchema = mongoose.Schema(
  {
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
    images: [
      {
        type: String,
      },
    ],
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    location: {
      type: String,
    },
    contactInfo: {
      type: String,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    supportCount: {
      type: Number,
      required: true,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    updates: [
      {
        title: { type: String },
        content: { type: String },
        date: { type: Date, default: Date.now },
        images: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Case = mongoose.model("Case", caseSchema);

export default Case;
