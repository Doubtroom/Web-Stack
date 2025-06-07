import React, { useState } from 'react';
import InputField from '../components/InputField';
import Button from '../components/ButtonAuth';
import { Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signup, sendOtp,setOtpSent } from '../store/authSlice';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';

const SignupPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const { loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      const result = await dispatch(signup({
        displayName: formData.name,
        email: formData.email,
        password: formData.password
      })).unwrap();
      
      if (result.user) {
        toast.success('Account created successfully! Please verify your email.');
        dispatch(sendOtp(formData.email));
          dispatch(setOtpSent(true));
          navigate('/verify-otp', { 
            replace: true,
            state: { email: formData.email }
          });
      }
    } catch (error) {
      console.error(error)
      toast.error(error ||'Signup failed. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create an account</h1>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sign up to get started</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-2">
            <InputField
              type="text"
              placeholder="Enter your full name"
              icon={<User size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              value={formData.name}
              id="name"
              label="Name"
              error={errors.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <InputField
              type="email"
              id="email"
              label="Email"
              placeholder="Enter your email"
              icon={<Mail size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              value={formData.email}
              error={errors.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <InputField
              type="password"
              placeholder="Create a password"
              icon={<Lock size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              value={formData.password}
              id="password"
              label="Password"
              error={errors.password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <InputField
              type="password"
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              icon={<Lock size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6 mt-8">
            <Button 
              text="Sign Up" 
              variant="primary" 
              fullWidth 
              isLoading={loading}
              loadingText="Creating account..."
            />
          </div>

          <div className="text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;