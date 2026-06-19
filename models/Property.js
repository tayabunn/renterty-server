import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  propertyType: { type: String, enum: ['Apartment', 'House', 'Villa', 'Studio', 'Cabin'], required: true },
  rent: { type: Number, required: true },
  rentType: { type: String, enum: ['Monthly', 'Weekly', 'Daily'], required: true },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  size: { type: Number },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  extraFeatures: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionFeedback: { type: String, default: '' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerEmail: { type: String, required: true }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
export default Property;
