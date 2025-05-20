import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Case from '../models/caseModel.js';
import connectDB from '../config/db.js';

dotenv.config();

const fixMissingStatus = async () => {
  try {
    await connectDB();
    console.log('Connected to database'.green.inverse);
    
    // Find records where status is undefined or null
    const casesWithoutStatus = await Case.find({ status: { $exists: false } });
    console.log(`Found ${casesWithoutStatus.length} cases without status field`.yellow);
    
    // Update all to pending status
    if (casesWithoutStatus.length > 0) {
      const updateResult = await Case.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'pending' } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} cases`.green);
    }
    
    console.log('Script completed'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

fixMissingStatus();