import express from 'express';
import Property from '../models/Property.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// GET / - Public Route - List approved properties with search, filter, sort, pagination
router.get('/', async (req, res) => {
  try {
    const { location, propertyType, minPrice, maxPrice, sort, page = 1, limit = 6 } = req.query;

    const query = { status: 'Approved' };

    // Search by Location (regex, case-insensitive)
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Filter by Property Type
    if (propertyType && propertyType !== 'All') {
      query.propertyType = propertyType;
    }

    // Filter by Price range (rent)
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default sorting
    if (sort === 'priceAsc') {
      sortOptions = { rent: 1 };
    } else if (sort === 'priceDesc') {
      sortOptions = { rent: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalProperties = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('ownerId', 'name email photo');

    res.json({
      properties,
      totalPages: Math.ceil(totalProperties / limitNum),
      currentPage: pageNum,
      totalProperties
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error listing properties', error: error.message });
  }
});

// GET /featured - Public Route - Show 6 approved properties
router.get('/featured', async (req, res) => {
  try {
    const properties = await Property.find({ status: 'Approved' })
      .limit(6)
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email photo');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing featured properties', error: error.message });
  }
});

// GET /owner - Owner Route - Get properties created by currently logged-in owner
router.get('/owner', verifyToken, verifyRole(['Owner']), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing owner properties', error: error.message });
  }
});

// GET /admin - Admin Route - Get all properties for review
router.get('/admin', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const properties = await Property.find()
      .sort({ createdAt: -1 })
      .populate('ownerId', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing properties for admin', error: error.message });
  }
});

// GET /:id - Public Route - Get specific property details
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId', 'name email photo');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving property details', error: error.message });
  }
});

// POST / - Owner Route - Add a new property
router.post('/', verifyToken, verifyRole(['Owner']), async (req, res) => {
  const {
    title,
    description,
    location,
    propertyType,
    rent,
    rentType,
    bedrooms,
    bathrooms,
    size,
    amenities,
    images,
    extraFeatures
  } = req.body;

  try {
    const newProperty = new Property({
      title,
      description,
      location,
      propertyType,
      rent,
      rentType,
      bedrooms,
      bathrooms,
      size,
      amenities: amenities || [],
      images: images || [],
      extraFeatures,
      status: 'Pending', // Initially pending admin approval
      ownerId: req.user.id,
      ownerEmail: req.user.email
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding property', error: error.message });
  }
});

// PUT /:id - Owner/Admin Route - Update property details
router.put('/:id', verifyToken, verifyRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership if user is Owner
    if (req.user.role === 'Owner' && property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this listing' });
    }

    const updatedFields = req.body;
    // If owner modifies listing, reset its status to Pending for safety
    if (req.user.role === 'Owner') {
      updatedFields.status = 'Pending';
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating property', error: error.message });
  }
});

// DELETE /:id - Owner/Admin Route - Delete a property listing
router.delete('/:id', verifyToken, verifyRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership if user is Owner
    if (req.user.role === 'Owner' && property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this listing' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting property', error: error.message });
  }
});

// PATCH /:id/status - Admin Route - Approve/Reject listing
router.patch('/:id/status', verifyToken, verifyRole(['Admin']), async (req, res) => {
  const { status, rejectionFeedback } = req.body;
  try {
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Choose Approved or Rejected' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.status = status;
    if (status === 'Rejected') {
      property.rejectionFeedback = rejectionFeedback || 'Not specified';
    } else {
      property.rejectionFeedback = '';
    }

    await property.save();
    res.json({ message: `Property listing status set to ${status}`, property });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating property status', error: error.message });
  }
});

export default router;
