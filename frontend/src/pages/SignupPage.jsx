import React, { useState } from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { Mail, Lock, User,ArrowRight } from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../firebase/AuthService';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      otp:""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const dispatch=useDispatch()


    const handleSendOtp = async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setIsLoading(true);
      try {
        await authService.sendOtp(formData.email);
        toast.success("OTP sent successfully! Check your email");
        setStep(2);
      } catch (error) {
        setMessage(error);
      }
      setIsLoading(false);
    };

    const handleVerifyOtp = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        await authService.verifyOtp(formData.email, formData.otp);
        await handleSignup()
        toast.success("OTP verified successfully! Creating account Please wait ");
        
      } catch (error) {
        toast.error(error)
      }
      setIsLoading(false);
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        if (errors[id]) {
          setErrors(prev => ({ ...prev, [id]: '' }));
        }
    };

  const handleSignup = async() => {
    
    try {
      const user =await authService.signUp(formData.email,formData.password)
      const userString=JSON.stringify(user)
      localStorage.setItem("userData",userString)
      toast.success('Account created successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    }
  };

  const validate = () => {
    const newErrors= {};
    
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

  // async function handleGoogleSignup(){
  //   try {
  //       await authService.signInWithGoogle()
  //       toast.success("Signup Successful with Google")
  //   } catch (error) {
  //       const errorMessage = error.code.split("auth/")[1] || "unknown-error"
  //       toast.error(`Signup failed: ${errorMessage}`);
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
{  step==1 && (    
  <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        <form onSubmit={handleSendOtp}>
          <div className="mb-2">
            <InputField
              type="text"
              placeholder="Enter your full name"
              icon={<User size={18} />}
              value={formData.name}
              id="name"
              label={"Name"}
              error={errors.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <InputField
              type="email"
              id={"email"}
              label={"Email"}
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              value={formData.email}
              error={errors.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-2">
            <InputField
              type="password"
              placeholder="Create a password"
              icon={<Lock size={18} />}
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
              icon={<Lock size={18} />}
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <Button  text="Create Account" variant="primary" fullWidth isLoading={isLoading} loadingText={"Sending OTP..."} />
          </div>
        </form>

        {/* <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <div className="bg-white px-4 relative text-gray-500 text-sm">OR</div>
        </div>

        <div className="mb-2">
          <GoogleLoginButton onClick={handleGoogleSignup} />
        </div> */}

        <div className="text-center text-gray-600">
          Already have an account?{' '}
          <Link 
              to="/login" 
              className="text-blue-500 text-sm inline-flex items-center"
            >
              Login<ArrowRight size={14} className="ml-1" />
            </Link>
        </div>
      </div>)}
      {
        step==2&&(
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Verify your OTP</h1>
          </div>
          <form onSubmit={handleVerifyOtp}>
          <div className="mb-2">
            <InputField
              type="text"
              placeholder="Enter OTP"
              icon={<Lock size={18} />}
              value={formData.otp}
              id="otp"
              label={"OTP"}
              error={errors.otp}
              onChange={handleChange}
              // style={{ appearance: 'textfield' }}
            />
          </div>

          <div className="mb-6">
            <Button  text="Verify" variant="primary" fullWidth isLoading={isLoading} loadingText={"Verifying OTP..."} />
          </div>
          </form>

          </div>
        )
      }
    </div>
  );
};

export default SignupPage;