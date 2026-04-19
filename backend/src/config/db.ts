import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    
    const host = conn.connection.host || 'Unknown Host';
    console.log(`MongoDB Connected: ${host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("CRITICAL: Check your MongoDB Atlas Network Access IP Whitelist.");
    process.exit(1);
  }
};

export default connectDB;