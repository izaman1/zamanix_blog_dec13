import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { generateToken, hashPassword, comparePasswords } from '../utils/auth.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Special handling for admin login
  if (email === 'admin@zamanix.com') {
    if (password === process.env.ADMIN_PASSWORD) {
      return res.json({
        status: 'success',
        data: {
          _id: 'admin',
          name: 'Admin',
          email: 'admin@zamanix.com',
          role: 'admin',
          token: generateToken('admin', email)
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid admin credentials');
    }
  }

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Update login streak and award coins
  await user.updateLoginStreak();
  
  // Calculate streak bonus (max 50 coins)
  const streakBonus = Math.min(user.loginStreak.current * 5, 50);
  user.coins += (10 + streakBonus); // Base 10 coins + streak bonus
  await user.save();

  res.json({
    status: 'success',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      coins: user.coins,
      loginStreak: user.loginStreak,
      token: generateToken(user._id)
    }
  });
});

// Rest of the controller remains the same...