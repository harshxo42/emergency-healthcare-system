import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  location: {
    x: { type: Number, required: true }, // Grid coordinate x (0-100)
    y: { type: Number, required: true }  // Grid coordinate y (0-100)
  },
  problem: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['Critical', 'High', 'Normal'],
    default: 'Normal'
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Dispatched', 'EnRoute', 'Arrived', 'Resolved'],
    default: 'Pending'
  },
  assignedAmbulance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance',
    default: null
  },
  assignedHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  }
}, {
  timestamps: true
});

export const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', emergencySchema);
export default Emergency;
