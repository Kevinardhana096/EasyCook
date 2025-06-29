import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    clearError();

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        // Success notification could be added here
        navigate(from, { replace: true });
      } else {
        setFormError("root", { message: result.message });
      }
    } catch (err) {
      setFormError("root", { message: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{ backgroundImage: "url('/images/web.png')" }}
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Header with Enhanced Design */}
          <div className="text-center mb-10">
            <h2 className="text-5xl text-orange-50 font-serif font-semibold mb-2">
              Welcome Back!
            </h2>
            <p className="text-orange-50 text-base font-brand font-normal">
              Sign in to access your recipe collection
            </p>
            
            {/* Show message if user was redirected from protected route */}
            {location.state?.from && (
              <div className="mt-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
                <p className="text-sm">
                  Please log in to access that page
                </p>
              </div>
            )}
          </div>

          {/* Main Login Card with Enhanced Design */}
          <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all duration-300">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
              {/* Error Alert */}
              {(error || errors.root) && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        {error || errors.root?.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Field with Enhanced Styling */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className={`w-full px-12 py-3 font-brand text-black placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all duration-300 group-hover:bg-white ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:bg-white"
                    }`}
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaEnvelope className="text-gray-400 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field with Enhanced Styling */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full px-12 py-4 pr-12 font-brand text-black placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all duration-300 group-hover:bg-white ${
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:bg-white"
                    }`}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-gray-400 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-700 transition-colors duration-300 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm font-medium flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password with Enhanced Design */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-700 bg-gray-100 border-gray-300 rounded focus:ring-orange-700 focus:ring-2 transition-all duration-300"
                  />
                  <span className="ml-3 text-sm font-brand font-medium text-orange-50 group-hover:text-orange-300 transition-colors duration-300">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold font-brand text-red-400 hover:text-red-500 hover:underline transition-all duration-300"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button with Enhanced Design */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-800 font-semibold font-brand py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <span className="ml-2">Signing In ...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
            
            {/* Sign Up Link with Enhanced Design */}
            <div className="text-center mt-6 pt-6 border-t border-gray-100">
              <p className="text-orange-50 font-brand text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="ml-1 font-semibold text-sm text-orange-500 hover:text-orange-600 hover:underline transition-all duration-300"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
