import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    x: { type: Number, required: true }, // Grid coordinate x (0-100)
    y: { type: Number, required: true }  // Grid coordinate y (0-100)
  },
  totalBeds: {
    type: Number,
    required: true,
    default: 10
  },
  availableBeds: {
    type: Number,
    required: true,
    default: 5
  },
  specialties: {
    type: [String],
    default: ['General Medicine']
  },
  contact: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema);
export default Hospital;
