import express from 'express';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// POST / - Tenant Route - Create booking after successful Stripe payment
router.post('/', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  const { propertyId, moveInDate, contactNumber, additionalNotes, transactionId, amount } = req.body;
  try {
    if (!propertyId || !moveInDate || !contactNumber || !transactionId || !amount) {
      return res.status(400).json({ message: 'All booking fields and transaction ID are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create the booking record
    const newBooking = new Booking({
      propertyId: property._id,
      propertyName: property.title,
      tenantId: req.user.id,
      tenantName: req.user.name || 'Tenant',
      tenantEmail: req.user.email,
      ownerId: property.ownerId,
      moveInDate,
      contactNumber,
      additionalNotes: additionalNotes || '',
      amount,
      bookingStatus: 'Pending',
      paymentStatus: 'Paid',
      transactionId
    });

    const savedBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking completed successfully', booking: savedBooking });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating booking', error: error.message });
  }
});

// GET /tenant - Tenant Route - Get bookings of currently logged-in tenant
router.get('/tenant', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  try {
    const bookings = await Booking.find({ tenantId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing tenant bookings', error: error.message });
  }
});

// GET /owner - Owner Route - Get booking requests for properties owned by logged-in owner
router.get('/owner', verifyToken, verifyRole(['Owner']), async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing owner booking requests', error: error.message });
  }
});

// GET /admin - Admin Route - Get all bookings on the platform
router.get('/admin', verifyToken, verifyRole(['Admin']), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('tenantId', 'name email')
      .populate('ownerId', 'name email');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error listing admin bookings', error: error.message });
  }
});

// PATCH /:id/status - Owner Route - Approve or Reject booking request
router.patch('/:id/status', verifyToken, verifyRole(['Owner']), async (req, res) => {
  const { status } = req.body;
  try {
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Choose Approved or Rejected' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check ownership
    if (booking.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this property' });
    }

    booking.bookingStatus = status;
    await booking.save();

    res.json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating booking status', error: error.message });
  }
});

export default router;
