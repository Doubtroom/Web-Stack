import React, { useEffect, useState } from 'react';
import InputField from '../components/InputField';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';
import authService from '../firebase/AuthService.js'

const LoginPage = () => {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
      })
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        
        if (errors[id]) {
          setErrors(prev => ({ ...prev, [id]: '' }));
        }
      };
  const validate = () => {
    const newErrors= {};
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const user =await authService.login(formData.email,formData.password)
      const userString=JSON.stringify(user)
      localStorage.setItem("userData",userString)

    //   toast.success('Logged in successfully!');
      navigate('/home');
    } catch (error) {
      console.log(error)
      const errorMessage = error.code.split("auth/")[1] || "unknown-error"
    //   toast.error(`Login failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await authService.signInWithGoogle();
      if (user) {
        const userString=JSON.stringify(user)
        localStorage.setItem("userData",userString)
        // toast.success('Logged in with Google successfully!');
      }
      navigate('/home');
    } catch (error) {
      console.error(error)
      // toast.error('Google login failed. Please try again.');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600">Login to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <InputField
              label={"Email"}
              type="email"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              id="email"
            />
          </div>

          <div className="mb-6">
            <InputField
              label={"Password"}
              id="password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock size={18} />}
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <div className="flex justify-end mt-2">
              <Link to={"/forgotpassword"}>
                <h2 className="text-blue-500 text-sm hover:underline">Forgot Password</h2>
              </Link>
            </div>
          </div>

          <div className="mb-6">
            <Button text="Login" isLoading={isLoading} loadingText={"Loggingin"} variant="primary" fullWidth disabled={isLoading} />
          </div>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <div className="bg-white px-4 relative text-gray-500 text-sm">OR</div>
        </div>

        <div className="mb-6">
          <GoogleLoginButton onClick={handleGoogleLogin} disabled={isLoading} />
        </div>

        <div className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link 
              to="/signup" 
              className="text-blue-500 text-sm inline-flex items-center"
            >
              Sign up <ArrowRight size={14} className="ml-1" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;