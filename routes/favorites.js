import express from 'express';
import Favorite from '../models/Favorite.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// POST / - Tenant Route - Save a property to favorites
router.post('/', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  const { propertyId } = req.body;
  try {
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }

    // Check if already favorited
    const existingFav = await Favorite.findOne({ tenantId: req.user.id, propertyId });
    if (existingFav) {
      return res.status(400).json({ message: 'Property is already in favorites' });
    }

    const favorite = new Favorite({
      tenantId: req.user.id,
      propertyId
    });

    await favorite.save();
    res.status(201).json({ message: 'Property added to favorites', favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving favorite', error: error.message });
  }
});

// GET / - Tenant Route - List all favorites with populated property details
router.get('/', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  try {
    const favorites = await Favorite.find({ tenantId: req.user.id })
      .populate({
        path: 'propertyId',
        select: 'title location rent rentType propertyType images'
      })
      .sort({ createdAt: -1 });

    // Filter out favorites where property was deleted in the database
    const validFavorites = favorites.filter(fav => fav.propertyId !== null);
    res.json(validFavorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching favorites list', error: error.message });
  }
});

// DELETE /:id - Tenant Route - Remove from favorites (accepts favorite ID or property ID)
router.delete('/:id', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  try {
    // Check if ID is a favorite ID or property ID
    let deletedFav = await Favorite.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.id
    });

    if (!deletedFav) {
      deletedFav = await Favorite.findOneAndDelete({
        propertyId: req.params.id,
        tenantId: req.user.id
      });
    }

    if (!deletedFav) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing favorite', error: error.message });
  }
});

export default router;
