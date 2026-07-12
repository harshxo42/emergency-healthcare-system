import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Dispatched', 'Busy'],
    default: 'Available'
  },
  location: {
    x: { type: Number, required: true }, // Grid coordinate x (0-100)
    y: { type: Number, required: true }  // Grid coordinate y (0-100)
  },
  driverName: {
    type: String,
    required: true
  },
  driverContact: {
    type: String,
    required: true
  },
  currentEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency',
    default: null
  }
}, {
  timestamps: true
});

export const Ambulance = mongoose.models.Ambulance || mongoose.model('Ambulance', ambulanceSchema);
export default Ambulance;
