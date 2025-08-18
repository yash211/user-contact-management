import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import homepageImage from '../../assets/homepage.png';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User authenticated:', user);
      if (user && user.role === 'user') {
        console.log('Redirecting to user dashboard');
        navigate('/user-dashboard');
      } else {
        console.log('Redirecting to user dashboard (default)');
        navigate('/user-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 items-center justify-center">
        <div className="text-center text-white px-8">
          <div className="w-100  h-[28rem] bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center mb-6 overflow-hidden">
            <img 
              src={homepageImage} 
              alt="Contact Management" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <h1 className="text-3xl font-bold mb-4">Contact Management</h1>
          <p className="text-lg text-blue-100">
            Organize and manage your contacts efficiently
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Get started with your account'}
            </p>
          </div>

          {isLogin ? (
            <LoginForm />
          ) : (
            <SignupForm />
          )}

          <div className="text-center mt-6">
            <button
              onClick={toggleForm}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
