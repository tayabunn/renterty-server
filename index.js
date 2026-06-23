import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

// Import routers
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import bookingsRouter from './routes/bookings.js';
import paymentsRouter from './routes/payments.js';
import reviewsRouter from './routes/reviews.js';
import favoritesRouter from './routes/favorites.js';
import reportsRouter from './routes/reports.js';

if (process.env.VERCEL !== '1') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    console.warn('Could not set DNS servers locally:', err.message);
  }
}
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Diagnostics In-Memory Request Logger
const requestLogs = [];
app.use((req, res, next) => {
  if (req.url.includes('/auth') || req.url.includes('/db-check') || req.url.includes('/logs')) {
    requestLogs.push({
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      path: req.path,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        authorization: req.headers.authorization ? 'Bearer present' : 'none'
      }
    });
    if (requestLogs.length > 50) requestLogs.shift();
  }
  next();
});

app.get('/api/logs', (req, res) => {
  res.json(requestLogs);
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['set-auth-token']
}));

const condJson = (req, res, next) => {
  const path = req.path;
  const originalUrl = req.originalUrl || '';
  
  const isCustom = path === '/profile' || originalUrl.endsWith('/profile') ||
                   path === '/me' || originalUrl.endsWith('/me') ||
                   path === '/users' || originalUrl.endsWith('/users') ||
                   (path.startsWith('/users/') && path.endsWith('/role')) ||
                   (originalUrl.includes('/users/') && originalUrl.endsWith('/role'));
                   
  if (isCustom) {
    express.json()(req, res, next);
  } else {
    next();
  }
};

// Route custom auth endpoints before Better Auth splat
app.use('/api/auth', condJson);
app.use('/api/auth', authRouter);

// Better Auth handler must be registered BEFORE global body parser (express.json())
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/renterty';

let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    const db = await mongoose.connect(mongoURI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected successfully via Mongoose');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isConnected = false;
  }
};

// Eagerly connect on start
connectDB();

// Middleware to ensure DB connection is ready on every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Renterty: Property Rental & Booking Platform API' });
});

// Favicon handler to prevent 404 log noise in production
app.get(['/favicon.ico', '/favicon.png'], (req, res) => res.status(204).end());

// Base API Endpoint welcome route
app.get('/api', (req, res) => {
  res.json({ message: 'Renterty API: The server is online and database is connected successfully.' });
});

// Diagnostics endpoint to check DB state
app.get('/api/db-check', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    mongooseState: states[state],
    dbConnected: state === 1,
    vercel: process.env.VERCEL === '1'
  });
});

// API Routes
app.use('/api/properties', propertiesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/reports', reportsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
