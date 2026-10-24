const mongoose = require('mongoose');

// Global cache for serverless environments (Vercel / AWS Lambda)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  const mongoUri = process.env.MONGODB_URI || (!isProd ? 'mongodb://127.0.0.1:27017/staffsync' : null);

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is missing in Vercel settings. Please add MONGODB_URI under Project Settings > Environment Variables.');
  }

  // Return existing active connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection promise is already in flight, await it
  if (!cached.promise) {
    const opts = {
      autoIndex: true,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      console.log(`[MongoDB] Successfully connected: ${mongooseInstance.connection.name} @ ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
