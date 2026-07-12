import * as dbService from '../services/dbService.js';
import { sortHospitalsByProximity } from '../utils/SortingUtils.js';

export const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await dbService.getHospitals();
    return res.status(200).json({
      success: true,
      data: hospitals
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getNearestHospitals = async (req, res) => {
  const { x, y } = req.query;

  if (x === undefined || y === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Patient coordinates x and y are required in query params.'
    });
  }

  try {
    const patientLocation = { x: parseFloat(x), y: parseFloat(y) };
    const hospitals = await dbService.getHospitals();
    
    // DSA Sorting: Sort using our custom quicksort algorithm
    const sortedHospitals = sortHospitalsByProximity(hospitals, patientLocation);

    return res.status(200).json({
      success: true,
      message: 'Closest hospitals calculated using DSA Quick Sort.',
      data: sortedHospitals
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
