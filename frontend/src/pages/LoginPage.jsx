import React, { useState, useEffect } from 'react';
import InputField from '../components/InputField';
import { Mail, Lock } from 'lucide-react';
import Button from '../components/ButtonAuth';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { login, sendOtp, fetchUser, setAuth } from '../store/authSlice';
import { toast } from 'sonner';
import LoadingSpinner from '../components/LoadingSpinner';
import VerificationPrompt from '../components/VerificationPrompt';
import { authService } from '../services/auth.services';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const { loading, error } = useSelector((state) => state.auth);
  const [isVerificationPromptOpen, setIsVerificationPromptOpen] = useState(false);
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);
  const [recoveryUser, setRecoveryUser] = useState(null);
  const [loginState, setLoginState] = useState({
    isProcessing: false,
    step: 'idle', // idle -> logging -> fetching -> updating -> navigating
    error: null
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  // Monitor auth state changes
  const authState = useSelector(state => state.auth);
  useEffect(() => {
    if (loginState.step === 'updating' && authState.isAuthenticated) {
      setLoginState(prev => ({ ...prev, step: 'navigating' }));
    }
  }, [authState.isAuthenticated]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (errors[id]) {
      setErrors(prev => ({ ...prev, [id]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = () => {
    setIsVerificationPromptOpen(false);
    dispatch(sendOtp(formData.email));
    navigate('/verify-otp', { 
      replace: true,
      state: { email: formData.email }
    });
  };

  const handleNewAccount = () => {
    setIsVerificationPromptOpen(false);
    navigate('/signup');
  };

  const handleClosePrompt = () => {
    setIsVerificationPromptOpen(false);
  };

  const handlePasswordRecovery = async (newPassword) => {
    try {
      const response = await authService.recoverFirebasePassword(recoveryUser.userId, newPassword);
      
      if (response.data) {
        toast.success('Password recovered successfully! Please login with your new password.');
        setIsPasswordRecoveryOpen(false);
        setRecoveryUser(null);
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password recovery failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validate()) {
      return false;
    }

    if (loginState.isProcessing) return;
    
    setLoginState({
      isProcessing: true,
      step: 'logging',
      error: null
    });
    
    try {
      // Step 1: Login
      const result = await dispatch(login(formData)).unwrap();
      
      // Check if this is a Firebase password recovery case
      if (result.isFirebaseRecovery) {
        setRecoveryUser(result.user);
        setIsPasswordRecoveryOpen(true);
        setLoginState({
          isProcessing: false,
          step: 'idle',
          error: null
        });
        return;
      }
      
      if (!result.user.isVerified) {
        setIsVerificationPromptOpen(true);
        setLoginState({
          isProcessing: false,
          step: 'idle',
          error: null
        });
        return;
      }

      // Step 2: Fetch fresh user data
      setLoginState(prev => ({ ...prev, step: 'fetching' }));
      const userResult = await dispatch(fetchUser()).unwrap();
      
      // Step 3: Update auth state
      setLoginState(prev => ({ ...prev, step: 'updating' }));
      dispatch(setAuth({
        isAuthenticated: true,
        isVerified: true,
        user: userResult
      }));

      // Step 4: Check profile completion
      const hasCompleteProfile = Boolean(
        userResult.branch && 
        userResult.studyType && 
        userResult.gender && 
        userResult.role && 
        userResult.collegeName && 
        userResult.dob
      );

      // Step 5: Navigate based on profile completion
      if (hasCompleteProfile) {
        navigate('/home', { replace: true });
      } else {
        navigate('/complete-profile', { replace: true });
      }

      toast.success('Logged in successfully!');
    } catch (error) {
      toast.error(error || 'Login failed. Please try again.');
      setLoginState({
        isProcessing: false,
        step: 'idle',
        error: error
      });
    }
  };

  if (loading || loginState.isProcessing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <VerificationPrompt
        isOpen={isVerificationPromptOpen}
        onClose={handleClosePrompt}
        onVerify={handleVerify}
        onNewAccount={handleNewAccount}
      />
      {isPasswordRecoveryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>Set New Password</h2>
            <p className={`mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Please set a new password for your account
            </p>
            <InputField
              type="password"
              id="newPassword"
              label="New Password"
              placeholder="Enter new password"
              icon={<Lock size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                text="Cancel"
                variant="secondary"
                onClick={() => {
                  setIsPasswordRecoveryOpen(false);
                  setRecoveryUser(null);
                }}
              />
              <Button
                text="Set Password"
                variant="primary"
                onClick={() => handlePasswordRecovery(formData.newPassword)}
              />
            </div>
          </div>
        </div>
      )}
      <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>Welcome back</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Login to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
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

          <div className="mb-6">
            <InputField
              type="password"
              id="password"
              label="Password"
              placeholder="Enter your password"
              icon={<Lock size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              value={formData.password}
              error={errors.password}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <Button 
              text="Login" 
              variant="primary" 
              fullWidth 
              isLoading={loading || loginState.isProcessing}
              loadingText={`${loginState.step === 'logging' ? 'Logging in...' : 
                          loginState.step === 'fetching' ? 'Loading user data...' :
                          loginState.step === 'updating' ? 'Updating session...' :
                          'Please wait...'}`}
              type="submit"
            />
          </div>

          <div className="text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;