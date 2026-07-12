import * as dbService from '../services/dbService.js';

export const getPatientHistory = async (req, res) => {
  const { patientId } = req.params;
  
  try {
    const patient = await dbService.getPatientById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: `Patient ID ${patientId} not found in database history.`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Patient history fetched successfully using DSA HashMap index.',
      data: patient
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const patients = await dbService.getPatients();
    return res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createNewPatient = async (req, res) => {
  try {
    const patient = await dbService.createPatient(req.body);
    return res.status(201).json({
      success: true,
      message: 'Patient record created and cached in HashMap.',
      data: patient
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
