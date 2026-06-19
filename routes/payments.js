import express from 'express';
import Stripe from 'stripe';
import { verifyToken, verifyRole } from '../middleware/auth.js';

const router = express.Router();

// Initialize Stripe (will fallback to dummy if key not configured, but ideally real test key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

// POST /create-payment-intent - Tenant Route - Create a payment intent for booking
router.post('/create-payment-intent', verifyToken, verifyRole(['Tenant']), async (req, res) => {
  const { amount } = req.body;
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required' });
    }

    // Stripe amount is in cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card']
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Stripe error creating payment intent', error: error.message });
  }
});

export default router;
