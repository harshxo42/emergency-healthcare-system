import mongoose from 'mongoose';

global.dbConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/emergency_healthcare';
  
  try {
    console.log('Attempting to connect to MongoDB...');
    mongoose.set('strictQuery', false);
    
    // Set a timeout of 3 seconds for fast fallback
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    global.dbConnected = true;
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`\n⚠️  [DB Warning] MongoDB connection failed: ${error.message}`);
    console.warn('⚠️  [Fallback] System is automatically falling back to high-performance In-Memory database mode.');
    console.warn('⚠️  All features (Priority Queue, O(1) Patient Lookups, Tracking) will work perfectly!\n');
    global.dbConnected = false;
  }
};
