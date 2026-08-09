import mongoose from 'mongoose';
import { config } from '@/config/env';

const MONGODB_URI = config.mongodbUri;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2500, // 2.5s fast timeout fallback
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      cached.isMock = false;
      return mongooseInstance;
    }).catch((err) => {
      console.warn('⚠️ Could not connect to local MongoDB. Enabling Worklance In-Memory Data Store fallback:', err.message);
      cached.isMock = true;
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.isMock = true;
  }

  return cached.conn;
}

export function isMockDB(): boolean {
  return cached.isMock;
}
