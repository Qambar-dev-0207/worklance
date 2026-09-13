import mongoose from 'mongoose';
import { config } from '@/config/env';

export function getNormalizedMongoUri(): string {
  let uri = (config.mongodbUri || '').trim();
  // Strip accidental surrounding quotes if copied into env vars
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  // Ensure URI routes specifically to the 'worklance' database
  if (uri.includes('mongodb+srv://') || uri.includes('mongodb://')) {
    try {
      const urlObj = new URL(uri);
      urlObj.pathname = '/worklance';
      return urlObj.toString();
    } catch {
      // Regex replace if URL parsing fails on custom protocol
      return uri.replace(/\.net\/[^?]*(\?|$)/, '.net/worklance$1');
    }
  }

  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  isMock: boolean;
  lastError: string | null;
}

const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache };

let cached: MongooseCache = globalForMongoose.mongoose || {
  conn: null,
  promise: null,
  isMock: false,
  lastError: null,
};

if (!globalForMongoose.mongoose) {
  globalForMongoose.mongoose = cached;
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    cached.isMock = false;
    cached.lastError = null;
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = getNormalizedMongoUri();
    const opts: mongoose.ConnectOptions = {
      dbName: 'worklance',
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log('🔄 Connecting to MongoDB Atlas (database: worklance)...');
    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB Atlas [worklance] successfully.');
        cached.isMock = false;
        cached.lastError = null;
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('⚠️ Could not connect to MongoDB Atlas [worklance]:', err.message);
        cached.isMock = true;
        cached.lastError = err.message;
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
      cached.lastError = null;
    } else {
      cached.conn = null;
      cached.promise = null;
      cached.isMock = true;
    }
  } catch (e: any) {
    cached.promise = null;
    cached.conn = null;
    cached.isMock = true;
    cached.lastError = e?.message || 'Unknown connection error';
  }

  return cached.conn;
}

export function isMockDB(): boolean {
  return cached.isMock || mongoose.connection.readyState !== 1;
}

export function getDbConnectionDetails() {
  return {
    readyState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    isMock: isMockDB(),
    dbName: mongoose.connection.name || 'worklance',
    lastError: cached.lastError,
  };
}
