import * as dbService from '../services/dbService.js';
import { PriorityQueue } from '../utils/PriorityQueue.js';
import { calculateDistance, sortHospitalsByProximity } from '../utils/SortingUtils.js';

// Instantiate the Priority Queue in memory
export const emergencyQueue = new PriorityQueue();

/**
 * Initializes the priority queue by loading pending emergencies from the database.
 */
export const initializeQueue = async () => {
  try {
    const emergencies = await dbService.getEmergencies();
    const pendingCases = emergencies.filter(e => e.status === 'Pending');
    
    emergencyQueue.heap = []; // Clear heap
    pendingCases.forEach(caseItem => {
      emergencyQueue.enqueue(caseItem);
    });
    
    console.log(`[DSA Priority Queue] Initialized with ${emergencyQueue.size()} pending cases.`);
  } catch (error) {
    console.error('Failed to initialize priority queue:', error);
  }
};

export const createEmergencyRequest = async (req, res) => {
  const { patient: patientId, locationName, location, problem, severity } = req.body;

  if (!patientId || !locationName || !location || !problem || !severity) {
    return res.status(400).json({
      success: false,
      message: 'All fields (patient, locationName, location, problem, severity) are required.'
    });
  }

  try {
    // 1. HashMap Lookup: O(1) fetch patient history details
    const patientInfo = await dbService.getPatientById(patientId);
    const patientName = patientInfo ? patientInfo.name : `Patient #${patientId}`;

    // 2. Create emergency database record
    const emergencyData = {
      patientId,
      patientName,
      locationName,
      location: {
        x: parseFloat(location.x),
        y: parseFloat(location.y)
      },
      problem,
      severity,
      status: 'Pending'
    };

    const emergency = await dbService.createEmergency(emergencyData);

    // 3. DSA Priority Queue: Enqueue new emergency case
    emergencyQueue.enqueue(emergency);

    console.log(`[DSA Priority Queue] Enqueued case ${emergency._id} (Severity: ${severity}). Total size: ${emergencyQueue.size()}`);

    return res.status(201).json({
      success: true,
      message: 'Emergency request received and enqueued in Priority Queue.',
      data: {
        emergency,
        queuePosition: emergencyQueue.getOrderedList().findIndex(e => e._id.toString() === emergency._id.toString()) + 1,
        totalInQueue: emergencyQueue.size()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getPriorityQueueList = async (req, res) => {
  try {
    const orderedList = emergencyQueue.getOrderedList();
    return res.status(200).json({
      success: true,
      message: 'Priority queue fetched (Critical first, then High, then Normal).',
      data: orderedList
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const dispatchAmbulance = async (req, res) => {
  const { emergencyId } = req.body;

  try {
    let emergency = null;

    // 1. Get emergency case: either specific ID or extract top of priority queue
    if (emergencyId) {
      const emergencies = await dbService.getEmergencies();
      emergency = emergencies.find(e => e._id.toString() === emergencyId.toString() && e.status === 'Pending');
      if (!emergency) {
        return res.status(404).json({ success: false, message: 'Pending emergency case not found.' });
      }
      // Remove it from the queue if present
      emergencyQueue.heap = emergencyQueue.heap.filter(e => e._id.toString() !== emergencyId.toString());
      emergencyQueue.heapifyDown(0); // re-heapify
    } else {
      // Dequeue highest priority case
      emergency = emergencyQueue.dequeue();
      if (!emergency) {
        return res.status(400).json({
          success: false,
          message: 'No pending emergencies in the Priority Queue.'
        });
      }
    }

    // 2. DSA Sorting: Find closest available ambulance
    const ambulances = await dbService.getAmbulances();
    const availableAmbs = ambulances.filter(a => a.status === 'Available');

    if (availableAmbs.length === 0) {
      // Re-enqueue the emergency since we cannot dispatch right now
      emergencyQueue.enqueue(emergency);
      return res.status(400).json({
        success: false,
        message: 'No available ambulances for dispatch. Case returned to Priority Queue.',
        data: emergency
      });
    }

    // Calculate distance to each available ambulance and sort
    const sortedAmbs = availableAmbs.map(amb => ({
      ...amb,
      distance: calculateDistance(amb.location, emergency.location)
    })).sort((a, b) => a.distance - b.distance);

    const targetAmbulance = sortedAmbs[0]; // The closest ambulance

    // 3. DSA Sorting: Find closest hospital with available beds
    const hospitals = await dbService.getHospitals();
    const sortedHospitals = sortHospitalsByProximity(hospitals, emergency.location);
    
    // Choose the best hospital (closest that has available beds, otherwise closest fallback)
    const targetHospital = sortedHospitals[0];

    if (!targetHospital) {
      // Re-enqueue emergency
      emergencyQueue.enqueue(emergency);
      return res.status(500).json({
        success: false,
        message: 'No hospitals available in routing index. Case returned to queue.'
      });
    }

    // 4. Update states (State Machine transition to Dispatched)
    // Decrement bed count of assigned hospital if they have beds
    if (targetHospital.availableBeds > 0) {
      await dbService.updateHospitalBeds(targetHospital._id, -1);
    }

    // Mark ambulance as Dispatched and set currentEmergency ref
    await dbService.updateAmbulance(targetAmbulance._id, {
      status: 'Dispatched',
      currentEmergency: emergency._id
    });

    // Update emergency details
    const updatedEmergency = await dbService.updateEmergency(emergency._id, {
      status: 'Dispatched',
      assignedAmbulance: targetAmbulance._id,
      assignedHospital: targetHospital._id
    });

    console.log(`[DSA Dispatch] Dispatched ${targetAmbulance.vehicleNumber} (dist: ${targetAmbulance.distance.toFixed(1)}) to emergency ${emergency._id}. Assigned hospital: ${targetHospital.name}`);

    return res.status(200).json({
      success: true,
      message: 'Ambulance dispatched and hospital bed reserved.',
      data: {
        emergency: updatedEmergency,
        ambulance: targetAmbulance,
        hospital: targetHospital
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const resolveEmergency = async (req, res) => {
  const { id } = req.params;

  try {
    const emergencies = await dbService.getEmergencies();
    const emergency = emergencies.find(e => e._id.toString() === id.toString());
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency case not found.' });
    }

    if (emergency.status === 'Resolved') {
      return res.status(400).json({ success: false, message: 'Emergency is already resolved.' });
    }

    const ambulanceId = emergency.assignedAmbulance?._id || emergency.assignedAmbulance;
    const hospitalId = emergency.assignedHospital?._id || emergency.assignedHospital;

    // Get assigned hospital location to place the ambulance there upon resolve
    let finalLocation = { x: 50, y: 50 }; // default
    if (hospitalId) {
      const hosp = await dbService.getHospitalById(hospitalId);
      if (hosp) finalLocation = hosp.location;
    }

    // 1. Free the ambulance, update status, and set location to the hospital
    if (ambulanceId) {
      await dbService.updateAmbulance(ambulanceId, {
        status: 'Available',
        currentEmergency: null,
        location: finalLocation
      });
    }

    // 2. Set emergency status to Resolved
    const updatedEmergency = await dbService.updateEmergency(id, {
      status: 'Resolved'
    });

    console.log(`[DSA Resolve] Resolved emergency ${id}. Ambulance returned to service at hospital location.`);

    return res.status(200).json({
      success: true,
      message: 'Emergency case successfully resolved. Vehicle returned to Available status.',
      data: updatedEmergency
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllEmergencies = async (req, res) => {
  try {
    const list = await dbService.getEmergencies();
    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
