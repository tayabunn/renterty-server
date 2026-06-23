import express from 'express';
import User from '../models/User.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

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

// PUT /profile - Update current logged-in user profile details (name, email, photo)
router.put('/profile', verifyToken, async (req, res) => {
  const { name, email, photo } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken by another account' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (photo !== undefined) {
      user.photo = photo;
      user.image = photo; // Keep image synchronized for Better Auth compatibility
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo || user.image || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
  }
});

export default router;
