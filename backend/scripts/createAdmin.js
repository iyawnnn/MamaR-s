import mongoose from 'mongoose';
import User from '../src/models/User.js';
import 'dotenv/config';

const createAdmin = async () => {
  try {
    // Connect to the local bakery_db
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

    const adminUser = new User({
      name: 'Local System Admin',
      email: adminEmail,
      password: adminPassword, 
      role: 'admin'
    });

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