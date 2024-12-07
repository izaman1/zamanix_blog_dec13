import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

interface LoginFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ onClose, onSuccess }: LoginFormProps) {
  const { login, signup } = useUser();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
          setError('All fields are required');
          return;
        }
        
        const success = await signup(formData);
        if (success) {
          toast.success('Account created successfully! Welcome to Zamanix.');
          onSuccess();
        } else {
          setError('Failed to create account. Email might be already in use.');
        }
      } else {
        const success = await login(formData.email, formData.password);
        if (success) {
          if (formData.email === 'admin@zamanix.com') {
            toast.success('Welcome back, Admin!');
          } else {
            toast.success('Welcome back to Zamanix!');
          }
          onSuccess();
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white w-[90%] max-w-md rounded-lg shadow-xl mx-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-light">{isSignup ? 'Create Account' : 'Login'}</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            {isSignup && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black disabled:bg-gray-100"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black disabled:bg-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black disabled:bg-gray-100"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 text-sm tracking-wider hover:bg-black/90 transition-colors disabled:bg-gray-400 flex items-center justify-center"
            >
              {isLoading ? (
                <LoadingSpinner size="small" message={isSignup ? 'Creating account...' : 'Signing in...'} />
              ) : (
                isSignup ? 'CREATE ACCOUNT' : 'LOGIN'
              )}
            </button>

            {!isLoading && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-gray-600 hover:text-black"
                >
                  {isSignup ? 'Already have an account? Login' : 'Don\'t have an account? Sign up'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}