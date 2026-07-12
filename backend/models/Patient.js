import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  allergies: {
    type: [String],
    default: []
  },
  medicalConditions: {
    type: [String],
    default: []
  },
  contact: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
export default Patient;
