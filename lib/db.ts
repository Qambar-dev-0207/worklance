import mongoose from 'mongoose';
import { config } from '@/config/env';

const MONGODB_URI = config.mongodbUri;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  isMock: boolean;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null, isMock: false };

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    cached.isMock = false;
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000, // 10s timeout to allow cloud Atlas handshake
    };

    console.log('🔄 Connecting to MongoDB Atlas...');
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB Atlas successfully.');
        cached.isMock = false;
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn('⚠️ Could not connect to MongoDB Atlas. Enabling Worklance In-Memory Data Store fallback:', err.message);
        cached.isMock = true;
        cached.promise = null;
        cached.conn = null;
        return null;
      });
  }

  try {
    const instance = await cached.promise;
    if (instance && mongoose.connection.readyState === 1) {
      cached.conn = instance;
      cached.isMock = false;
    } else {
      cached.conn = null;
      cached.promise = null;
      cached.isMock = true;
    }
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    cached.isMock = true;
  }

  return cached.conn;
}

export function isMockDB(): boolean {
  return cached.isMock || mongoose.connection.readyState !== 1;
}
