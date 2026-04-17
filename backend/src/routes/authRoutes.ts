import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import 'dotenv/config';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const newUser = new User({ name, email, password });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  console.log(`\n---> 1. Login attempt received for: ${req.body.email}`);
  try {
    console.log('---> 2. Querying database for user...');
    const user = await User.findOne({ email: req.body.email });
    
    if (!user) {
      console.log('---> ❌ User not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    console.log('---> 3. User found, comparing passwords...');
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    
    if (!isMatch) {
      console.log('---> ❌ Password incorrect');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('---> 4. Password correct, generating token...');
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('---> ✅ Login successful, sending response');
    res.json({ token, user: { name: user.name, email: user.email, role: user.role, _id: user._id } });
  } catch (err) {
    console.error('---> ❌ Server Error during login:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;