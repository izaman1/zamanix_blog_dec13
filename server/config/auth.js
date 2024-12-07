import dotenv from 'dotenv';

dotenv.config();

export const AUTH_CONFIG = {
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    validateCredentials: (email, password) => 
      email === process.env.ADMIN_EMAIL && 
      password === process.env.ADMIN_PASSWORD
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '30d'
  }
};

// Validate required environment variables
const requiredEnvVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});