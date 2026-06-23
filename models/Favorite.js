import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  tenantId: { type: String, ref: 'User', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true }
}, { timestamps: true });

// Avoid duplicate favorites for the same user and property
favoriteSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
