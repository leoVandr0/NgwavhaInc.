import mongoose from 'mongoose';

const connectMongoDB = async () => {
  if (!process.env.MONGO_URL) {
    console.log('ℹ️  MongoDB URI not provided, skipping MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️  Continuing without MongoDB...');
  }
};

export default connectMongoDB;
