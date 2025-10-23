import mongoose from "mongoose";
import dotenv from "dotenv";
import Case from "../models/caseModel.js";
import connectDB from "../config/db.js";

dotenv.config();

// Kết nối database
connectDB();

const addSupportTypeToExistingCases = async () => {
  try {
    console.log("Đang kiểm tra và cập nhật supportType cho các hoàn cảnh...");

    // Tìm tất cả các case không có supportType hoặc supportType = null
    const casesWithoutSupportType = await Case.find({
      $or: [
        { supportType: { $exists: false } },
        { supportType: null },
        { supportType: "" }
      ]
    });

    console.log(`Tìm thấy ${casesWithoutSupportType.length} hoàn cảnh cần cập nhật`);

    if (casesWithoutSupportType.length === 0) {
      console.log("Tất cả hoàn cảnh đã có supportType");
      process.exit(0);
    }

    let updatedCount = 0;

    for (const caseItem of casesWithoutSupportType) {
      // Xác định supportType dựa trên dữ liệu hiện có
      let supportType = "money"; // Mặc định là money

      const hasTargetAmount = caseItem.targetAmount && caseItem.targetAmount > 0;
      const hasNeededItems = caseItem.neededItems && caseItem.neededItems.length > 0;

      if (hasTargetAmount && hasNeededItems) {
        supportType = "both";
      } else if (hasNeededItems && !hasTargetAmount) {
        supportType = "items";
      } else {
        supportType = "money";
      }

      // Cập nhật case
      caseItem.supportType = supportType;
      await caseItem.save();

      updatedCount++;
      console.log(
        `Cập nhật case ${caseItem._id} - "${caseItem.title}" - supportType: ${supportType}`
      );
    }

    console.log(`\n✅ Đã cập nhật ${updatedCount} hoàn cảnh thành công!`);
    
    // Hiển thị thống kê
    const stats = await Case.aggregate([
      {
        $group: {
          _id: "$supportType",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log("\nThống kê loại hỗ trợ:");
    stats.forEach(stat => {
      console.log(`  ${stat._id || 'null'}: ${stat.count} hoàn cảnh`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Lỗi khi cập nhật supportType:", error);
    process.exit(1);
  }
};

addSupportTypeToExistingCases();
