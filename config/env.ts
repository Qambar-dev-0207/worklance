export const config = {
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://qambar:qambar0207@cluster0.sravbfn.mongodb.net/worklance?retryWrites=true&w=majority',
  jwtSecret: process.env.JWT_SECRET || 'worklance_production_super_secret_jwt_key_2026_key_98374',
  adminSecretKey: process.env.ADMIN_SECRET_KEY || 'worklance_admin_secret_key_2026',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@worklance.com',
  adminLoginId: process.env.ADMIN_LOGIN_ID || 'WL-ADMIN-2026',
  adminPassword: process.env.ADMIN_PASSWORD || 'Worklance@Admin#2026',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  isProd: process.env.NODE_ENV === 'production',
};

