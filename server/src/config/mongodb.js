import mongoose from 'mongoose';

const connectMongoDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!mongoUri) {
    console.log('ℹ️  MongoDB URI not provided, skipping MongoDB connection');
    return;
  }

  const maxRetries = 5;
  const retryDelay = 5000; // 5 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return; // Success
    } catch (error) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`);

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.log('⚠️  Continuing without MongoDB after multiple failed attempts...');
      }
    }
  }
};

export default connectMongoDB;
