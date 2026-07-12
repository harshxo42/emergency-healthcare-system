import express from 'express';
import { getAllAmbulances, updateAmbulanceLocation } from '../controllers/ambulanceController.js';

const router = express.Router();

router.get('/', getAllAmbulances);
router.put('/:id', updateAmbulanceLocation);

export default router;
