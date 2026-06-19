import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Property from './models/Property.js';
import Review from './models/Review.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/renterty';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing database entries.');

    // Create passwords hashes
    const adminHash = await bcrypt.hash('adminpassword123', 10);
    const ownerHash = await bcrypt.hash('ownerpassword123', 10);
    const tenantHash = await bcrypt.hash('tenantpassword123', 10);

    // Create users
    const adminUser = new User({
      name: 'System Admin',
      email: 'admin@renterty.com',
      password: adminHash,
      role: 'Admin',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'
    });

    const ownerUser = new User({
      name: 'Jane Doe',
      email: 'owner@renterty.com',
      password: ownerHash,
      role: 'Owner',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60'
    });

    const tenantUser = new User({
      name: 'John Smith',
      email: 'tenant@renterty.com',
      password: tenantHash,
      role: 'Tenant',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60'
    });

    const savedAdmin = await adminUser.save();
    const savedOwner = await ownerUser.save();
    const savedTenant = await tenantUser.save();

    console.log('Seeded users (Admin: admin@renterty.com / adminpassword123)');

    // Seed Properties
    const properties = [
      {
        title: 'Modern Downtown Studio',
        description: 'A cozy and modern studio apartment in the heart of downtown. Fully furnished with high-speed internet and premium fixtures.',
        location: 'New York, NY',
        propertyType: 'Studio',
        rent: 1800,
        rentType: 'Monthly',
        bedrooms: 1,
        bathrooms: 1,
        size: 550,
        amenities: ['Wifi', 'Air Conditioning', 'Gym', 'Laundry'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: '10-minute walk from Subway. Rooftop access included.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Elegant Waterfront Villa',
        description: 'Stunning waterfront villa with panoramic ocean views, infinity pool, and private dock. Experience luxury living.',
        location: 'Miami, FL',
        propertyType: 'Villa',
        rent: 5500,
        rentType: 'Monthly',
        bedrooms: 4,
        bathrooms: 4.5,
        size: 3200,
        amenities: ['Pool', 'Wifi', 'Air Conditioning', 'Hot Tub', 'Garage'],
        images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Private chef optional. 24/7 gated security.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Cozy Mountain Log Cabin',
        description: 'Escape to nature in this beautiful timber frame log cabin. Large stone fireplace and outdoor hot tub overlooking the mountains.',
        location: 'Aspen, CO',
        propertyType: 'Cabin',
        rent: 250,
        rentType: 'Daily',
        bedrooms: 2,
        bathrooms: 2,
        size: 1100,
        amenities: ['Fireplace', 'Wifi', 'Hot Tub', 'Heating'],
        images: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Ski-in ski-out access. Firewood provided.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Spacious Suburban House',
        description: 'Charming family home in a quiet suburban neighborhood. Large fenced backyard, modern kitchen, and top-rated school district.',
        location: 'Austin, TX',
        propertyType: 'House',
        rent: 2800,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 2.5,
        size: 1850,
        amenities: ['Garage', 'Backyard', 'Dishwasher', 'Laundry'],
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Recently renovated. Pet friendly.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'High-rise Luxury Apartment',
        description: 'Stunning city views from this 24th floor apartment. High ceilings, floor-to-ceiling windows, and top tier building amenities.',
        location: 'Chicago, IL',
        propertyType: 'Apartment',
        rent: 3200,
        rentType: 'Monthly',
        bedrooms: 2,
        bathrooms: 2,
        size: 1150,
        amenities: ['Wifi', 'Air Conditioning', 'Gym', 'Pool', 'Concierge'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Indoor parking spot included. Storage locker available.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Ocean Front Beach Bungalow',
        description: 'Walk straight onto the sand from your front porch. Relaxing and bright beach bungalow, perfect for couples or small families.',
        location: 'Malibu, CA',
        propertyType: 'House',
        rent: 900,
        rentType: 'Weekly',
        bedrooms: 2,
        bathrooms: 1,
        size: 900,
        amenities: ['Wifi', 'Beach Access', 'Air Conditioning', 'Patio'],
        images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Surfboards and paddleboards available for use.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      }
    ];

    const savedProperties = await Property.insertMany(properties);
    console.log('Seeded 6 approved properties.');

    // Seed 4 Reviews for customer reviews section
    const reviews = [
      {
        propertyId: savedProperties[0]._id,
        tenantId: savedTenant._id,
        tenantName: 'Sarah Jenkins',
        tenantEmail: 'sarah.j@example.com',
        rating: 5,
        comment: 'Beautiful studio! It was extremely clean, right in the center of the city, and the booking process was seamless.'
      },
      {
        propertyId: savedProperties[1]._id,
        tenantId: savedTenant._id,
        tenantName: 'Michael Chang',
        tenantEmail: 'm.chang@example.com',
        rating: 5,
        comment: 'Absolutely spectacular villa. The pool and sunset views were breathtaking. Our owner Jane Doe was extremely helpful!'
      },
      {
        propertyId: savedProperties[2]._id,
        tenantId: savedTenant._id,
        tenantName: 'Emily Watson',
        tenantEmail: 'emily.w@example.com',
        rating: 4,
        comment: 'Perfect mountain cabin getaway. The hot tub was amazing after a long day of hiking. Will definitely book again.'
      },
      {
        propertyId: savedProperties[3]._id,
        tenantId: savedTenant._id,
        tenantName: 'David Miller',
        tenantEmail: 'd.miller@example.com',
        rating: 5,
        comment: 'Wonderful family home. The yard was perfect for the kids and the neighborhood was so peaceful.'
      }
    ];

    await Review.insertMany(reviews);
    console.log('Seeded 4 tenant reviews.');

    console.log('Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
