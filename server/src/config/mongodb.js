import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ngwavha_content';

const connectMongoDB = async () => {
  if (!MONGODB_URI) {
    console.log('ℹ️  MongoDB URI not provided, skipping MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(✅ MongoDB connected: );
  } catch (error) {
    console.error(❌ MongoDB connection error: );
    // Don't exit process, continue without MongoDB
    console.log('⚠️  Continuing without MongoDB...');
  }
};

export default connectMongoDB;
