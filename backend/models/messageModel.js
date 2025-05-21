import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    case: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Case",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },
    // Các trường khác nếu có...
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
