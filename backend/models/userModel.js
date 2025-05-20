import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Đảm bảo trường avatar được định nghĩa đúng
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String, // Đây là kiểu dữ liệu đúng
      default: "",
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    bankAccount: {
      type: String,
    },
    bankName: {
      type: String,
    },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    totalSupported: {
      type: Number,
      default: 0,
    },
    supportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
