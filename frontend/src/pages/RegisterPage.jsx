import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch
  } = useForm();

  // Watch password for confirmation validation
  const password = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearError();

    try {
      const userData = {
        username: data.username,
        email: data.email,
        password: data.password,
        role: 'user', // Default role
        bio: ''
      };

      const result = await registerUser(userData);
      
      if (result.success) {
        // Success - user will be redirected by useEffect
        navigate('/');
      } else {
        setFormError('root', { message: result.message });
      }
    } catch (err) {
      setFormError('root', { message: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-brand font-bold text-gradient mb-2">
              🍳 CookEasy
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Join CookEasy!</h2>
          <p className="text-gray-600">Create your account and start sharing amazing recipes</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {(error || errors.root) && (
              <div className="alert alert-error">
                <div>
                  <span>{error || errors.root?.message}</span>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="nowriafisda"
                  className={`input input-bordered w-full pl-12 ${errors.username ? 'input-error' : 'focus:ring-2 focus:ring-primary'}`}
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores'
                    }
                  })}
                />
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.username.message}</span>
                </label>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <div className="relative">
                <input
                  type="email"HH
                  placeholder="nowriafisda@cookeasy.com"
                  className={`input input-bordered w-full pl-12 ${errors.email ? 'input-error' : 'focus:ring-2 focus:ring-primary'}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`input input-bordered w-full pl-12 pr-12 ${errors.password ? 'input-error' : 'focus:ring-2 focus:ring-primary'}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full pl-12 pr-12 ${errors.confirmPassword ? 'input-error' : 'focus:ring-2 focus:ring-primary'}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                </label>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary checkbox-sm mr-3"
                  {...register('terms', {
                    required: 'You must agree to the terms and conditions'
                  })}
                />
                <span className="label-text">
                  I agree to the{' '}
                  <Link to="/terms" className="link link-primary">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="link link-primary">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.terms.message}</span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" text="" />
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="divider my-6">Or continue with</div>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn btn-outline btn-sm">
              <FaGoogle className="mr-2" />
              Google
            </button>
            <button className="btn btn-outline btn-sm">
              <FaFacebook className="mr-2" />
              Facebook
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            Welcome to CookEasy, nowriafisda! 🎉<br />
            Join our community of passionate cooks today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;