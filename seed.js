import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Property from './models/Property.js';
import Review from './models/Review.js';
import { auth } from './lib/auth.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/renterty';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    try {
      await mongoose.connection.db.collection('user').deleteMany({});
      await mongoose.connection.db.collection('accounts').deleteMany({});
      await mongoose.connection.db.collection('account').deleteMany({});
      await mongoose.connection.db.collection('sessions').deleteMany({});
      await mongoose.connection.db.collection('session').deleteMany({});
    } catch (e) {
      // Collections might not exist yet
    }
    await Property.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing database entries.');

    // Create users using better-auth programmatic API
    const adminRes = await auth.api.signUpEmail({
      body: {
        name: 'System Admin',
        email: 'admin@renterty.com',
        password: 'adminpassword123',
        role: 'Admin',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60'
      }
    });

    const ownerRes = await auth.api.signUpEmail({
      body: {
        name: 'Jane Doe',
        email: 'owner@renterty.com',
        password: 'ownerpassword123',
        role: 'Owner',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60'
      }
    });

    const tenantRes = await auth.api.signUpEmail({
      body: {
        name: 'John Smith',
        email: 'tenant@renterty.com',
        password: 'tenantpassword123',
        role: 'Tenant',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60'
      }
    });

    const savedAdmin = adminRes.user;
    const savedOwner = ownerRes.user;
    const savedTenant = tenantRes.user;

    // Map id to _id for seed properties compatibility
    savedAdmin._id = savedAdmin.id;
    savedOwner._id = savedOwner.id;
    savedTenant._id = savedTenant.id;

    console.log('Seeded users via Better Auth (Admin: admin@renterty.com / adminpassword123)');

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
      },
      {
        title: 'Modern Penthouse Suite',
        description: 'A luxurious modern penthouse overlooking the downtown skyline. Floor-to-ceiling windows, expansive wrap-around balcony, private elevator access, and state-of-the-art kitchen.',
        location: 'Seattle, WA',
        propertyType: 'Apartment',
        rent: 4200,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 3,
        size: 1750,
        amenities: ['Wifi', 'Air Conditioning', 'Gym', 'Concierge', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Direct access to sky lounge. Climate-controlled storage.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Charming Tudor House',
        description: 'A beautiful historical Tudor-style home with modern updates. Nested in a wooded neighborhood with a private garden, hardwood floors, and breakfast nook.',
        location: 'Portland, OR',
        propertyType: 'House',
        rent: 3100,
        rentType: 'Monthly',
        bedrooms: 4,
        bathrooms: 3,
        size: 2200,
        amenities: ['Wifi', 'Backyard', 'Garage', 'Laundry'],
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Fitted fireplace, near downtown transit.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Luxury Desert Oasis Villa',
        description: 'Exquisite modern desert home featuring an expansive private swimming pool, outdoor fireplace, chef\'s kitchen, and gorgeous mountain views.',
        location: 'Phoenix, AZ',
        propertyType: 'Villa',
        rent: 6000,
        rentType: 'Monthly',
        bedrooms: 5,
        bathrooms: 5.5,
        size: 4100,
        amenities: ['Pool', 'Wifi', 'Hot Tub', 'Garage', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Fully smart-controlled home system.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Minimalist Urban Loft',
        description: 'Stylishly designed open-concept industrial loft with exposed brick walls, polished concrete floors, and soaring double-height ceilings in a vibrant historic building.',
        location: 'Boston, MA',
        propertyType: 'Apartment',
        rent: 2900,
        rentType: 'Monthly',
        bedrooms: 1,
        bathrooms: 1.5,
        size: 850,
        amenities: ['Wifi', 'Air Conditioning', 'Laundry', 'Elevator'],
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'In-unit washer/dryer. Building bike room storage.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Rustic Redwoods Cabin',
        description: 'Charming mountain cabin surrounded by majestic redwood trees. Relax in the hot tub on the wooden deck or read by the stone fireplace.',
        location: 'Eureka, CA',
        propertyType: 'Cabin',
        rent: 180,
        rentType: 'Daily',
        bedrooms: 1,
        bathrooms: 1,
        size: 650,
        amenities: ['Fireplace', 'Wifi', 'Patio', 'Heating'],
        images: ['https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Pet-friendly hiking trails begin directly from the back patio.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Sun-Drenched Beachside Studio',
        description: 'Bright and airy beachside studio apartment with stunning ocean views. Seconds from the beach, boardwalk, local dining, and surf rentals.',
        location: 'San Diego, CA',
        propertyType: 'Studio',
        rent: 2100,
        rentType: 'Monthly',
        bedrooms: 1,
        bathrooms: 1,
        size: 500,
        amenities: ['Wifi', 'Beach Access', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Includes surf storage locker.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Spacious Modern Ranch',
        description: 'Expansive modern ranch house with a large open-floor kitchen, fully fenced backyard, two-car garage, and views of the surrounding foothills.',
        location: 'Denver, CO',
        propertyType: 'House',
        rent: 3400,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 2,
        size: 1900,
        amenities: ['Wifi', 'Backyard', 'Garage', 'Laundry', 'Heating'],
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Solar panels installed. Reduced energy costs.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Historic Brick Townhouse',
        description: 'A classic three-story brick townhouse with high ceilings, crown molding, and original historic character. Features a private brick patio courtyard.',
        location: 'Philadelphia, PA',
        propertyType: 'House',
        rent: 2700,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 2.5,
        size: 1600,
        amenities: ['Wifi', 'Laundry', 'Patio', 'Dishwasher'],
        images: ['https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Private cellar storage. Near parks and cafes.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Luxury Golf Course Villa',
        description: 'Stunning contemporary villa overlooking the golf course green. Perfect indoor-outdoor flow, private golf cart garage, and heated spa pool.',
        location: 'Palm Springs, CA',
        propertyType: 'Villa',
        rent: 4800,
        rentType: 'Monthly',
        bedrooms: 3,
        bathrooms: 3.5,
        size: 2600,
        amenities: ['Pool', 'Wifi', 'Garage', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Heated salt-water pool. Golf club membership discounts.',
        status: 'Approved',
        ownerId: savedOwner._id,
        ownerEmail: savedOwner.email
      },
      {
        title: 'Quaint Country Cottage',
        description: 'A quiet, picture-perfect cottage surrounded by rolling hills and wildflower gardens. Cozy fireplace, original woodwork, and sunroom.',
        location: 'Nashville, TN',
        propertyType: 'House',
        rent: 2200,
        rentType: 'Monthly',
        bedrooms: 2,
        bathrooms: 1.5,
        size: 1200,
        amenities: ['Wifi', 'Backyard', 'Fireplace', 'Laundry'],
        images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60'],
        extraFeatures: 'Includes garden greenhouse space.',
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
