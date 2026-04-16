import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log("Check if your IP address has changed or if the Atlas cluster is paused.");
    process.exit(1);
  }
};

export default connectDB;