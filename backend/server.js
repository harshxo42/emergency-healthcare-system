import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedDB } from './services/dbService.js';
import { initializeQueue } from './controllers/emergencyController.js';

// Route Imports
import patientRoutes from './routes/patientRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import ambulanceRoutes from './routes/ambulanceRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';

// Load Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Emergency Healthcare API & Dispatch Operations Center Server.',
    databaseMode: global.dbConnected ? 'MongoDB' : 'In-Memory High-Performance Fallback'
  });
});

// Register API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/emergencies', emergencyRoutes);

// Catch-all route for unknown API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API Endpoint not found.'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: err.message
  });
});

// Start Server & Initialize Services
const startServer = async () => {
  // Connect to Database
  await connectDB();
  
  // Seed Database (MongoDB or In-Memory stores)
  await seedDB();
  
  // Load any pending database emergencies into the Priority Queue
  await initializeQueue();
  
  app.listen(PORT, () => {
    console.log(`=============================================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🛠️  Database Mode: ${global.dbConnected ? 'MongoDB (Atlas/Local)' : 'In-Memory Fallback'}`);
    console.log(`🩺 System operations ready for emergency dispatcher signals.`);
    console.log(`=============================================================`);
  });
};

startServer();
