// run with: node scripts/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: 'admin@bakery.com' });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }
  const user = new User({ name: 'Admin', email: 'admin@bakery.com', password: 'ChangeMe123!' });
  await user.save();
  console.log('Admin created', user.email);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
