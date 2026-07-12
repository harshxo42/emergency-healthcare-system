import Hospital from '../models/Hospital.js';
import Patient from '../models/Patient.js';
import Ambulance from '../models/Ambulance.js';
import Emergency from '../models/Emergency.js';
import { PatientHashMap } from '../utils/HashMap.js';

// In-Memory Fallback Stores
let inMemHospitals = [];
let inMemPatients = [];
let inMemAmbulances = [];
let inMemEmergencies = [];

// Create a HashMap for patient lookups
const patientCache = new PatientHashMap();

// Seed Data
const initialHospitals = [
  { name: 'Metro Heart Hospital', location: { x: 20, y: 30 }, totalBeds: 15, availableBeds: 6, specialties: ['Cardiology', 'Emergency'], contact: '9876543210' },
  { name: 'Max Super Specialty', location: { x: 80, y: 75 }, totalBeds: 20, availableBeds: 12, specialties: ['Neurology', 'Trauma', 'General'], contact: '9876543211' },
  { name: 'Fortis Hospital', location: { x: 45, y: 25 }, totalBeds: 10, availableBeds: 0, specialties: ['Orthopedics', 'General'], contact: '9876543212' },
  { name: 'Kailash Hospital', location: { x: 70, y: 15 }, totalBeds: 18, availableBeds: 8, specialties: ['General', 'Pediatrics'], contact: '9876543213' },
  { name: 'Apollo Clinic Noida', location: { x: 15, y: 85 }, totalBeds: 8, availableBeds: 4, specialties: ['General', 'Urgent Care'], contact: '9876543214' }
];

const initialAmbulances = [
  { vehicleNumber: 'AMB-101', status: 'Available', location: { x: 25, y: 35 }, driverName: 'Suresh Kumar', driverContact: '9999911111' },
  { vehicleNumber: 'AMB-102', status: 'Available', location: { x: 75, y: 70 }, driverName: 'Rajesh Singh', driverContact: '9999922222' },
  { vehicleNumber: 'AMB-103', status: 'Available', location: { x: 40, y: 30 }, driverName: 'Amit Sharma', driverContact: '9999933333' },
  { vehicleNumber: 'AMB-104', status: 'Available', location: { x: 65, y: 20 }, driverName: 'Vikrant Yadav', driverContact: '9999944444' },
  { vehicleNumber: 'AMB-105', status: 'Available', location: { x: 10, y: 80 }, driverName: 'Deepak Goel', driverContact: '9999955555' }
];

const initialPatients = [
  { patientId: '123', name: 'Rohan Sharma', age: 34, gender: 'Male', bloodGroup: 'O+', allergies: ['Penicillin'], medicalConditions: ['Asthma'], contact: '9111111111' },
  { patientId: '456', name: 'Priya Patel', age: 28, gender: 'Female', bloodGroup: 'A-', allergies: ['Peanuts'], medicalConditions: ['Diabetes'], contact: '9222222222' },
  { patientId: '789', name: 'Vikram Malhotra', age: 62, gender: 'Male', bloodGroup: 'B+', allergies: ['None'], medicalConditions: ['Hypertension', 'CAD'], contact: '9333333333' },
  { patientId: '999', name: 'Unknown / Trauma Patient', age: 40, gender: 'Other', bloodGroup: 'AB+', allergies: ['Unknown'], medicalConditions: ['None'], contact: '0000000000' }
];

// Seed DB function
export const seedDB = async () => {
  if (global.dbConnected) {
    try {
      const hospitalCount = await Hospital.countDocuments();
      if (hospitalCount === 0) {
        await Hospital.insertMany(initialHospitals);
        console.log('Hospitals seeded in MongoDB.');
      }
      
      const ambulanceCount = await Ambulance.countDocuments();
      if (ambulanceCount === 0) {
        await Ambulance.insertMany(initialAmbulances);
        console.log('Ambulances seeded in MongoDB.');
      }

      const patientCount = await Patient.countDocuments();
      if (patientCount === 0) {
        await Patient.insertMany(initialPatients);
        console.log('Patients seeded in MongoDB.');
      }

      // Populate Patient HashMap from MongoDB
      const allPatients = await Patient.find({});
      patientCache.clear();
      allPatients.forEach(p => {
        patientCache.put(p.patientId, p.toObject());
      });
      console.log(`Loaded ${patientCache.size()} patients into O(1) Lookup Cache.`);
    } catch (err) {
      console.error('Error seeding MongoDB:', err);
    }
  } else {
    // In-memory seeds
    // Use pseudo-ObjectIds for in-memory tracking
    inMemHospitals = initialHospitals.map((h, i) => ({ ...h, _id: `hosp_id_${i + 1}` }));
    inMemAmbulances = initialAmbulances.map((a, i) => ({ ...a, _id: `amb_id_${i + 1}`, currentEmergency: null }));
    inMemPatients = initialPatients.map((p, i) => ({ ...p, _id: `pat_id_${i + 1}` }));
    inMemEmergencies = [];

    // Populate Patient HashMap from in-memory arrays
    patientCache.clear();
    inMemPatients.forEach(p => {
      patientCache.put(p.patientId, p);
    });
    console.log(`[In-Memory] Seeded data and populated O(1) Patient Cache (${patientCache.size()} items).`);
  }
};

// --- DATA ACCESS LAYER APIS ---

// Patients
export const getPatients = async () => {
  if (global.dbConnected) return await Patient.find({});
  return inMemPatients;
};

export const getPatientById = async (patientId) => {
  // O(1) fast lookup using our custom HashMap cache
  const cached = patientCache.get(patientId);
  if (cached) {
    console.log(`[DSA HashMap] Cache Hit for patient ${patientId}`);
    return cached;
  }
  
  console.log(`[DSA HashMap] Cache Miss for patient ${patientId}`);
  if (global.dbConnected) {
    const patient = await Patient.findOne({ patientId });
    if (patient) {
      const obj = patient.toObject();
      patientCache.put(patientId, obj);
      return obj;
    }
  }
  return null;
};

export const createPatient = async (data) => {
  if (global.dbConnected) {
    const p = new Patient(data);
    await p.save();
    const obj = p.toObject();
    patientCache.put(obj.patientId, obj);
    return obj;
  } else {
    const newPatient = { ...data, _id: `pat_id_${Date.now()}` };
    inMemPatients.push(newPatient);
    patientCache.put(newPatient.patientId, newPatient);
    return newPatient;
  }
};

// Hospitals
export const getHospitals = async () => {
  if (global.dbConnected) return await Hospital.find({});
  return inMemHospitals;
};

export const getHospitalById = async (id) => {
  if (global.dbConnected) return await Hospital.findById(id);
  return inMemHospitals.find(h => h._id === id) || null;
};

export const updateHospitalBeds = async (id, delta) => {
  if (global.dbConnected) {
    return await Hospital.findByIdAndUpdate(id, { $inc: { availableBeds: delta } }, { new: true });
  } else {
    const h = inMemHospitals.find(h => h._id === id);
    if (h) {
      h.availableBeds = Math.max(0, Math.min(h.totalBeds, h.availableBeds + delta));
      return h;
    }
    return null;
  }
};

// Ambulances
export const getAmbulances = async () => {
  if (global.dbConnected) return await Ambulance.find({}).populate('currentEmergency');
  return inMemAmbulances;
};

export const getAmbulanceById = async (id) => {
  if (global.dbConnected) return await Ambulance.findById(id).populate('currentEmergency');
  return inMemAmbulances.find(a => a._id === id) || null;
};

export const updateAmbulance = async (id, updateData) => {
  if (global.dbConnected) {
    return await Ambulance.findByIdAndUpdate(id, updateData, { new: true }).populate('currentEmergency');
  } else {
    const idx = inMemAmbulances.findIndex(a => a._id === id);
    if (idx !== -1) {
      inMemAmbulances[idx] = { ...inMemAmbulances[idx], ...updateData };
      
      // Resolve reference simulation
      if (updateData.currentEmergency) {
        const emergencyObj = inMemEmergencies.find(e => e._id === updateData.currentEmergency);
        inMemAmbulances[idx].currentEmergency = emergencyObj || updateData.currentEmergency;
      } else if (updateData.currentEmergency === null) {
        inMemAmbulances[idx].currentEmergency = null;
      }
      return inMemAmbulances[idx];
    }
    return null;
  }
};

// Emergencies
export const getEmergencies = async () => {
  if (global.dbConnected) {
    return await Emergency.find({})
      .populate('assignedAmbulance')
      .populate('assignedHospital')
      .sort({ createdAt: -1 });
  }
  return [...inMemEmergencies].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const createEmergency = async (data) => {
  const insertData = { ...data, createdAt: new Date() };
  if (global.dbConnected) {
    const e = new Emergency(insertData);
    await e.save();
    return await Emergency.findById(e._id).populate('assignedAmbulance').populate('assignedHospital');
  } else {
    const newEmergency = {
      ...insertData,
      _id: `emerg_id_${Date.now()}`,
      assignedAmbulance: null,
      assignedHospital: null
    };
    inMemEmergencies.push(newEmergency);
    return newEmergency;
  }
};

export const updateEmergency = async (id, updateData) => {
  if (global.dbConnected) {
    return await Emergency.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedAmbulance')
      .populate('assignedHospital');
  } else {
    const idx = inMemEmergencies.findIndex(e => e._id === id);
    if (idx !== -1) {
      inMemEmergencies[idx] = { ...inMemEmergencies[idx], ...updateData };
      
      // Simulate ref nesting
      if (updateData.assignedAmbulance) {
        inMemEmergencies[idx].assignedAmbulance = inMemAmbulances.find(a => a._id === updateData.assignedAmbulance) || updateData.assignedAmbulance;
      }
      if (updateData.assignedHospital) {
        inMemEmergencies[idx].assignedHospital = inMemHospitals.find(h => h._id === updateData.assignedHospital) || updateData.assignedHospital;
      }
      return inMemEmergencies[idx];
    }
    return null;
  }
};
