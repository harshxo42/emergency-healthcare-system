import express from 'express';
import { getAllHospitals, getNearestHospitals } from '../controllers/hospitalController.js';

const router = express.Router();

router.get('/', getAllHospitals);
router.get('/nearest', getNearestHospitals);

export default router;
