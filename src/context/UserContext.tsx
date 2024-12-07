import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';
import { AUTH_CONFIG } from '../config/auth';
import toast from 'react-hot-toast';

interface LoginStreak {
  current: number;
  longest: number;
  startDate: string;
  lastLoginDate: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  coins: number;
  loginStreak: LoginStreak;
  addresses: any[];
  orders: any[];
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: any) => Promise<boolean>;
  updateUserDetails: (details: Partial<User>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Admin bypass
      if (email === AUTH_CONFIG.admin.email && password === 'Iftekhar786#') {
        const adminUser = {
          _id: 'admin',
          name: 'Admin',
          email: AUTH_CONFIG.admin.email,
          role: 'admin',
          phone: '',
          coins: 0,
          loginStreak: {
            current: 0,
            longest: 0,
            startDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString()
          },
          addresses: [],
          orders: []
        };

        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('token', 'admin-token');
        return true;
      }

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('token', data.token);
        return true;
      }
      
      toast.error(data.message || 'Login failed');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const signup = async (data: any): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setUser(result.data);
        localStorage.setItem('user', JSON.stringify(result.data));
        localStorage.setItem('token', result.token);
        return true;
      }

      toast.error(result.message || 'Signup failed');
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const updateUserDetails = async (details: Partial<User>) => {
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(details)
      });

      const data = await response.json();

      if (response.ok) {
        setUser(prev => prev ? { ...prev, ...data.data } : null);
        localStorage.setItem('user', JSON.stringify({ ...user, ...data.data }));
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      signup,
      updateUserDetails
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}