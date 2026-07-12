import express from 'express';
import { getAllPatients, createNewPatient, getPatientHistory } from '../controllers/patientController.js';

const router = express.Router();

router.get('/', getAllPatients);
router.post('/', createNewPatient);
router.get('/:patientId', getPatientHistory);

export default router;
