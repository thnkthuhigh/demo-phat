import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import Case from "../models/caseModel.js"; // Đảm bảo import này
import mongoose from "mongoose"; // Import mongoose

// Thêm logging để debug

export const getMessages = asyncHandler(async (req, res) => {
  const caseId = req.params.caseId;
  console.log(`Getting messages for case ${caseId}`);

  try {
    const messages = await Message.find({ case: caseId })
      .populate({
        path: "user",
        select: "name avatar",
      })
      .sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages for case ${caseId}`);
    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export const createMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const caseId = req.params.caseId;
  const userId = req.user._id;

  console.log(`Creating message for case ${caseId} by user ${userId}`);
  console.log("Message content:", content);

  if (!content || content.trim() === "") {
    console.log("Invalid message content");
    return res.status(400).json({ message: "Message content is required" });
  }

  try {
    // Kiểm tra case có tồn tại không
    const caseExists = await Case.findById(caseId);
    if (!caseExists) {
      console.log(`Case ${caseId} not found`);
      return res.status(404).json({ message: "Case not found" });
    }

    // Tạo và lưu tin nhắn mới
    const message = new Message({
      case: caseId,
      user: userId,
      content,
    });

    const savedMessage = await message.save();
    console.log("Message saved successfully:", savedMessage._id);

    // Populate user data
    await savedMessage.populate({
      path: "user",
      select: "name avatar",
    });

    res.status(201).json(savedMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
