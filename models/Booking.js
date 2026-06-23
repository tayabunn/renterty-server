import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  propertyName: { type: String, required: true },
  tenantId: { type: String, ref: 'User', required: true },
  tenantName: { type: String, required: true },
  tenantEmail: { type: String, required: true },
  ownerId: { type: String, ref: 'User', required: true },
  moveInDate: { type: Date, required: true },
  contactNumber: { type: String, required: true },
  additionalNotes: { type: String },
  amount: { type: Number, required: true },
  bookingStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  transactionId: { type: String }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
