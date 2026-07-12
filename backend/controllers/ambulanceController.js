import * as dbService from '../services/dbService.js';

export const getAllAmbulances = async (req, res) => {
  try {
    const ambulances = await dbService.getAmbulances();
    return res.status(200).json({
      success: true,
      data: ambulances
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateAmbulanceLocation = async (req, res) => {
  const { id } = req.params;
  const { x, y, status } = req.body;

  if (x === undefined || y === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Ambulance location coordinates (x, y) are required.'
    });
  }

  try {
    const updateData = { location: { x: parseFloat(x), y: parseFloat(y) } };
    if (status) updateData.status = status;

    const ambulance = await dbService.updateAmbulance(id, updateData);
    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Ambulance state updated successfully.',
      data: ambulance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
