import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOtp,setOtpSent } from '../store/authSlice';
import { toast } from 'sonner';
import Button from '../components/ButtonAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import InputField from '../components/InputField';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OtpVerificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const { loading } = useSelector((state) => state.auth);
  const user=useSelector((state)=>state?.auth?.user)
  
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (value.length <= 6) {
      setOtp(value);
      if (errors.otp) {
        setErrors(prev => ({ ...prev, otp: '' }));
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return;
    }

    if (otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'OTP must be 6 digits' }));
      return;
    }

    try {
      const result = await dispatch(verifyOtp(otp)).unwrap();
      
      if (result.user.isVerified) {
        toast.success('Email verified successfully!');
        dispatch(setOtpSent(false))
        if(user && (user.branch || user.studyType || user.gender || user.role || user.collegeName || user.dob)){
          navigate('/home', { replace: true });
        }else{
          navigate('/complete-profile',{replace:true})
        }
      }

    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'OTP verification failed';
      toast.error(errorMessage);
    }
  };

  if (loading) {
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
          }`}>Verify your email</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <form onSubmit={handleVerifyOtp}>
          <div className="mb-6">
            <InputField
              type="text"
              id="otp"
              label="OTP"
              placeholder="Enter 6-digit OTP"
              icon={<Mail size={18} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />}
              value={otp}
              error={errors.otp}
              onChange={handleOtpChange}
              maxLength={6}
            />
          </div>

          <div className="mb-6">
            <Button 
              text="Verify OTP" 
              variant="primary" 
              fullWidth 
              isLoading={loading}
              loadingText="Verifying..."
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationPage; 