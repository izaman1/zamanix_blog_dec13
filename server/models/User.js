import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s-]{10,}$/.test(v);
      },
      message: 'Please enter a valid phone number'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  loginStreak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    startDate: Date,
    lastLoginDate: Date,
    breaks: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  coins: {
    type: Number,
    default: 0
  },
  addresses: [{
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    isDefault: Boolean
  }],
  orders: [{
    orderId: String,
    date: Date,
    items: Array,
    total: Number,
    status: String
  }],
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordChange: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'loginStreak.lastLoginDate': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update login streak
userSchema.methods.updateLoginStreak = async function() {
  const now = new Date();
  const lastLogin = this.loginStreak.lastLoginDate;
  
  if (!lastLogin) {
    this.loginStreak.current = 1;
    this.loginStreak.longest = 1;
    this.loginStreak.startDate = now;
  } else {
    const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLogin === 1) {
      // Consecutive day login
      this.loginStreak.current += 1;
      if (this.loginStreak.current > this.loginStreak.longest) {
        this.loginStreak.longest = this.loginStreak.current;
      }
    } else if (daysSinceLastLogin > 1) {
      // Streak broken
      if (this.loginStreak.current > 0) {
        this.loginStreak.breaks.push({
          startDate: lastLogin,
          endDate: now,
          reason: 'Missed login'
        });
      }
      this.loginStreak.current = 1;
      this.loginStreak.startDate = now;
    }
  }
  
  this.loginStreak.lastLoginDate = now;
  await this.save();
};

// Static method to find admin
userSchema.statics.findAdmin = function() {
  return this.findOne({ email: 'admin@zamanix.com' });
};

export default mongoose.model('User', userSchema);