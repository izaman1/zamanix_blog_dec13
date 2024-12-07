import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Special handling for admin user
      if (decoded.email === 'admin@zamanix.com') {
        req.user = {
          _id: 'admin',
          email: 'admin@zamanix.com',
          role: 'admin'
        };
        return next();
      }
      
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Auth Error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error('You do not have permission to perform this action');
    }
    next();
  };
};

export const isAdmin = asyncHandler(async (req, res, next) => {
  // Special handling for admin email
  if (req.user.email === 'admin@zamanix.com') {
    return next();
  }
  
  res.status(403);
  throw new Error('Admin access required');
});