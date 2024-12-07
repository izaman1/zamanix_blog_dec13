const ADMIN_EMAIL = 'admin@zamanix.com';
const ADMIN_PASSWORD = 'Iftekhar786#';

export const AUTH_CONFIG = {
  admin: {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    isAdmin: (email: string) => email === ADMIN_EMAIL
  },
  jwt: {
    expiresIn: '30d'
  },
  session: {
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
};