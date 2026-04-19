import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { validate } from "../middleware/validate.js";
import "dotenv/config";

const router = express.Router();

const signupSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

// 1. Strict Auth Rate Limiting (Brute-Force Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/signup", validate(signupSchema), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // 2. Explicit Password Hashing Audit
    // Generate a secure salt and hash the plaintext password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });
    
    // Explicitly select which user fields to return to prevent leaking the hash
    res.json({ 
      token, 
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      } 
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// The loginLimiter is injected directly into this specific route pipeline
router.post("/login", loginLimiter, validate(loginSchema), async (req, res) => {
  console.log(`\n---> 1. Login attempt received for: ${req.body.email}`);
  try {
    console.log("---> 2. Querying database for user...");
    const user = await User.findOne({ email: req.body.email });

    if (!user || !user.password) {
      console.log("---> ❌ User not found or invalid password");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("---> 3. User found, comparing passwords...");
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      console.log("---> ❌ Password incorrect");
      return res.status(400).json({ error: "Invalid credentials" });
    }

    console.log("---> 4. Password correct, generating token...");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN as any,
    });

    console.log("---> Login successful, sending response");
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        _id: user._id,
      },
    });
  } catch (err) {
    console.error("---> Server Error during login:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;