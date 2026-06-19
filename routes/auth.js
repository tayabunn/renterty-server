import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /register - Email & Password Sign Up
router.post('/register', async (req, res) => {
  const { name, email, password, photo } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      photo: photo || '',
      role: 'Tenant' // Standard registration defaults to Tenant, role can be updated or chosen (standardized as Tenant initial register, can be changed later)
    });

    const savedUser = await newUser.save();
    const token = generateToken(savedUser);

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        photo: savedUser.photo,
        role: savedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error registering user', error: error.message });
  }
});

// POST /login - Email & Password Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error logging in', error: error.message });
  }
});

// POST /google-login - Social Login
router.post('/google-login', async (req, res) => {
  const { name, email, photo } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: 'Google email is required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user with Tenant role by default
      user = new User({
        name: name || 'Google User',
        email,
        photo: photo || '',
        role: 'Tenant'
      });
      await user.save();
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error handling Google login', error: error.message });
  }
});

// GET /me - Get current logged-in user profile
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile', error: error.message });
  }
});

// GET /users - (Admin only) List all users
router.get('/users', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users list', error: error.message });
  }
});

// PATCH /users/:id/role - (Admin only) Update role of a user
router.patch('/users/:id/role', verifyToken, verifyRole(['Admin']), async (req, res) => {
  const { role } = req.body;
  try {
    if (!['Tenant', 'Owner', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user role', error: error.message });
  }
});

export default router;
