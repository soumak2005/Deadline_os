import mongoose from 'mongoose';

let isConnected = false;
let useMemoryFallback = false;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/deadlinesos';
  
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    useMemoryFallback = false;
    console.log(`[DeadlineSOS DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[DeadlineSOS DB] MongoDB connection failed (${error.message}). Activating In-Memory Resilient DB Mode.`);
    useMemoryFallback = true;
    isConnected = true;
  }
};

export const getDBStatus = () => ({
  isConnected,
  useMemoryFallback
});
