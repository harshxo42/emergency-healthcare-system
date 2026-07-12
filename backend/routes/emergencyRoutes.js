import express from 'express';
import {
  createEmergencyRequest,
  getPriorityQueueList,
  dispatchAmbulance,
  resolveEmergency,
  getAllEmergencies
} from '../controllers/emergencyController.js';

const router = express.Router();

router.get('/', getAllEmergencies);
router.post('/', createEmergencyRequest);
router.get('/queue', getPriorityQueueList);
router.post('/dispatch', dispatchAmbulance);
router.post('/:id/resolve', resolveEmergency);

export default router;
