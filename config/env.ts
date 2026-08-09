export const config = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/worklance',
  jwtSecret: process.env.JWT_SECRET || 'worklance_production_super_secret_jwt_key_2026_key_98374',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
};
