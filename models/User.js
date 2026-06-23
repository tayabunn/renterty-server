import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  photo: { type: String },
  image: { type: String },
  password: { type: String },
  role: { type: String, enum: ['Tenant', 'Owner', 'Admin'], default: 'Tenant' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema, 'user');
export default User;
