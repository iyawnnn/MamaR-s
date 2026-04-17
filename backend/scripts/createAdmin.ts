import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { IUser } from '../src/types/index.js';
import 'dotenv/config';

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminEmail = 'admin@mamars.local';
    const adminPassword = 'admin'; 

    // Clear the existing local admin if you want to reset it
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️ Local admin found. Resetting credentials...');
      await User.deleteOne({ email: adminEmail });
    }

    const adminPayload: Partial<IUser> = {
      name: 'Local System Admin',
      email: adminEmail,
      password: adminPassword, 
      role: 'admin'
    };

    const adminUser = new User(adminPayload);

    await adminUser.save();
    console.log(`🎉 Success! You can now log in locally.`);
    console.log(`➡️  Email: ${adminEmail}`);
    console.log(`➡️  Password: ${adminPassword}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();