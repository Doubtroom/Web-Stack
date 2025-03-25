import React, { useState } from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { Mail, Lock, User,ArrowRight } from 'lucide-react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { Link } from 'react-router';

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    
    console.log('Signup with:', { fullName, email, password, confirmPassword });
  };

  const handleGoogleSignup = () => {
    console.log('Signup with Google');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="mb-2">
            <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
            <InputField
              type="text"
              placeholder="Enter your full name"
              icon={<User size={18} />}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <InputField
              type="email"
              placeholder="Enter your email"
              icon={<Mail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <InputField
              type="password"
              placeholder="Create a password"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
            <InputField
              type="password"
              placeholder="Confirm your password"
              icon={<Lock size={18} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <Button text="Create Account" variant="primary" fullWidth />
          </div>
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <div className="bg-white px-4 relative text-gray-500 text-sm">OR</div>
        </div>

        <div className="mb-2">
          <GoogleLoginButton onClick={handleGoogleSignup} />
        </div>

        <div className="text-center text-gray-600">
          Already have an account?{' '}
          <Link 
              to="/login" 
              className="text-blue-500 text-sm inline-flex items-center"
            >
              Login<ArrowRight size={14} className="ml-1" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;