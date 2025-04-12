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
import LoadingSpinner from '../components/LoadingSpinner';

const SignupPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, [id]: value }));
  
      if (errors[id]) {
          setErrors(prev => ({ ...prev, [id]: '' }));
      }
    };
    
    // const handleBlur = async (e) => {
    //   const { id, value } = e.target;
      
    //   if (id === 'email' && value) {
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     if (emailRegex.test(value)) {
    //       setIsCheckingEmail(true);
    //       try {
    //         const result = await authService.signUp(value, 'tempPassword123');
    //         await authService.logout();
    //         await authService.deleteUserByEmail(value);
    //         console.log("deleted user");
    //       } catch (error) {
    //         if (error.code === 'auth/email-already-in-use') {
    //           toast.error("Email already in use");
    //           setErrors(prev => ({ ...prev, email: 'Email already in use' }));
    //         }
    //       } finally {
    //         setIsCheckingEmail(false);
    //       }
    //     }
    //   }
    // };

    const handleSignup = async (e) => {
      e.preventDefault();
      if (!validate()) return;
      
      setIsLoading(true);
      try {
        const user = await authService.signUp(formData.email, formData.password);
        
        await authService.sendEmailVerification(user)
        
        setIsVerifying(true);
        toast.success('Verification email sent! Please check your inbox.');
        
        const checkVerification = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(checkVerification);
            setIsVerifying(false);
            
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
            
            toast.success('Email verified successfully!');
            navigate('/complete-profile', { replace: true });
          }
        }, 3000); // Check every 3 seconds
        
        // Stop checking after 5 minutes
        // setTimeout(() => {
        //   clearInterval(checkVerification);
        //   if (isVerifying) {
        //     setIsVerifying(false);
        //     toast.error('Email verification timed out. Please try again.');
        //   }
        // }, 300000);
        
      } catch (error) {
        let errorMessage = 'Signup failed. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak.';
        }
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
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

    if (isVerifying) {
      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="text-center">
              <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Verify your email
              </h1>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                We've sent a verification link to your email. Please check your inbox and click the link to verify your account.
              </p>
              <div className='flex justify-center items-center'>
                <LoadingSpinner />
              </div>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Don't forget to check your spam folder!
              </p>
            </div>
          </div>
        </div>
      );
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
                disabled={isCheckingEmail}
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
                isLoading={isLoading} 
                loadingText={"Creating account..."} 
                disabled={isLoading || isCheckingEmail}
              />
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
      </div>
    );
};

export default SignupPage;