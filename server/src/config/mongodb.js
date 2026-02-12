import mongoose from 'mongoose';

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.log('ℹ️  MongoDB URI not provided, skipping MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.log('⚠️  Continuing without MongoDB...');
  }
};

export default connectMongoDB;
