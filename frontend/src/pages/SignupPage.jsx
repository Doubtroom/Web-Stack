import React, { useState } from 'react';
import InputField from '../components/InputField';
import Button from '../components/ButtonAuth';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../firebase/AuthService';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import DataService from '../firebase/DataService';

const SignupPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [otpSent, setOtpSent] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    const checkEmailtest = async () => {
      setIsCheckingEmail(true)
      try {
        const result = await authService.signUp(formData.email, formData.password);
        await authService.logout()
        await authService.deleteUserByEmail(formData.email)
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          toast.error("Email already in use");
          return true;
        }
        throw error
      } finally {
        setIsCheckingEmail(false)
      }
      return false;
    }

    const handleSendOtp = async (e) => {
      e.preventDefault();
      if (!validate()) return;
      
      setIsLoading(true);
      try {
        await authService.sendOtp(formData.email);
        toast.success("OTP sent successfully! Check your email");
        setOtpSent(true);
        setStep(2);
      } catch (error) {
        console.error("Error in signup flow:", error);
        toast.error(error.message || "Failed to send OTP");
      } finally {
        setIsLoading(false);
      }
    };

    const handleVerifyOtp = async (e) => {
      e.preventDefault();
      if (!formData.otp) {
        setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
        return;
      }

      setIsLoading(true);
      try {
        await authService.verifyOtp(formData.email, formData.otp);
        await handleSignup();
      } catch (error) {
        toast.error(error.message || "OTP verification failed");
      } finally {
        setIsLoading(false);
      }
    };

    const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, [id]: value }));
  
      // Clear errors as the user types
      if (errors[id]) {
          setErrors(prev => ({ ...prev, [id]: '' }));
      }
  };
  
  // New function to validate only on blur (when user leaves the email field)
  const handleBlur = async (e) => {
    const { id, value } = e.target;
    
    if (id === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(value)) {
        setIsCheckingEmail(true);
              try {
                  const result = await authService.signUp(value, 'tempPassword123');
                  await authService.logout();
                  await authService.deleteUserByEmail(value);
              } catch (error) {
                  if (error.code === 'auth/email-already-in-use') {
                      toast.error("Email already in use");
                      setErrors(prev => ({ ...prev, email: 'Email already in use' }));
                  }
              } finally {
                  setIsCheckingEmail(false);
              }
          }
      }
  };
  

    const handleSignup = async() => {
      try {
        const user = await authService.signUp(formData.email, formData.password);
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: formData.name,
          photoURL: user.photoURL,
          collegeName: '',
          role: '',
          branch: '',
          studyType: '',
          phone: '',
          gender: ''
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("authStatus", "true");
        localStorage.setItem("profileCompleted", "false");
        localStorage.setItem("fromSignup", "true");
        
        dispatch(login({ 
          userData: { 
            email: user.email, 
            name: formData.name, 
            userID: user.uid 
          },
          status: true,
          profileCompleted: false
        }));
        
        toast.success('Account created successfully!');
        
        window.location.href = '/complete-profile';
      } catch (error) {
        let errorMessage = 'Signup failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak.';
        }
        toast.error(errorMessage);
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

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`p-6 rounded-lg shadow-xl flex flex-col items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Processing...</p>
            </div>
          </div>
        )}
        {step === 1 && (    
          <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create an account</h1>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Sign up to get started</p>
            </div>

            <form onSubmit={handleSendOtp}>
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
                  disabled={isCheckingEmail}
                  onBlur={handleBlur}
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
                <button
                  disabled={isLoading || isCheckingEmail}
                  onClick={handleSendOtp}
                  className={`py-3 px-4 rounded-md font-medium transition-colors duration-200 
                    w-full text-white flex items-center justify-center gap-2
                    ${isLoading || isCheckingEmail 
                      ? 'bg-blue-700' 
                      : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
            </form>

            <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-500 text-sm inline-flex items-center hover:text-blue-400"
              >
                Login<ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center mb-8">
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Verify your OTP</h1>
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Enter the OTP sent to your email</p>
            </div>
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-2">
                <InputField
                  type="text"
                  placeholder="Enter OTP"
                  icon={<Lock size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
                  value={formData.otp}
                  id="otp"
                  label="OTP"
                  error={errors.otp}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-6">
                <Button 
                  text="Verify OTP" 
                  variant="primary" 
                  fullWidth 
                  isLoading={isLoading} 
                  loadingText="Verifying OTP..." 
                />
              </div>
            </form>
          </div>
        )}
      </div>
    );
};

export default SignupPage;