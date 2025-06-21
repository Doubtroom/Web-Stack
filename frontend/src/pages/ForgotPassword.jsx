import React, { useState } from 'react';
import InputField from '../components/InputField';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../components/ButtonAuth';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { toast } from "sonner";
import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { authService } from '../services/auth.services';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
        await authService.requestReset(email);
        toast.success('Reset password link has been sent to your email');
        navigate('/login', { replace: true });
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset password link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Forgot Password</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Enter your email to reset your password
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <InputField
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              value={email}
              onChange={handleChange}
              disabled={isLoading}
              id="email"
              error={error}
            />
          </div>

          <div className="mb-6">
            <Button 
              text="Send Reset Link" 
              isLoading={isLoading} 
              loadingText="Sending..." 
              variant="primary" 
              fullWidth 
              disabled={isLoading} 
            />
          </div>
        </form>

        <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Remember your password?{' '}
          <Link 
            to="/login" 
            className="text-blue-500 text-sm inline-flex items-center"
          >
            <ArrowLeft size={14} className="mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 