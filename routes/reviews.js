import express from 'express';
import Review from '../models/Review.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// POST / - Tenant Route - Create a review for a property
router.post('/', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  const { propertyId, rating, comment } = req.body;
  try {
    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ message: 'Property ID, rating, and comment are required' });
    }

    const newReview = new Review({
      propertyId,
      tenantId: req.user.id,
      tenantName: req.user.name || 'Tenant',
      tenantEmail: req.user.email,
      rating,
      comment
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating review', error: error.message });
  }
});

// GET /property/:id - Public Route - Get all reviews for a property
router.get('/property/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing property reviews', error: error.message });
  }
});

export default router;
