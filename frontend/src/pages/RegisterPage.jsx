import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaGoogle,
  FaFacebook,
  FaUtensils,
  FaHeart,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register: registerUser,
    isAuthenticated,
    error,
    clearError,
  } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch,
  } = useForm();

  // Watch password for confirmation validation
  const password = watch("password");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
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
        role: data.role || "user", // Use selected role or default to user
        bio: "",
      };

      const result = await registerUser(userData);

      if (result.success) {
        // Success - user will be redirected by useEffect
        navigate("/");
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
      className="min-h-screen bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url('/images/web.png')" }}
    >
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block group"></Link>
            <h2 className="text-5xl text-orange-50 font-serif font-semibold mb-2">
              Register Now!
            </h2>
            <p className="text-orange-50 text-base font-brand font-normal">
              Create your account and start sharing amazing recipes
            </p>
          </div>

          {/* Main Register Card */}
          <div className="backdrop-blur-lg rounded-3xl shadow-2xl p-10 hover:shadow-3xl transition-all duration-300">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

              {/* Username Field */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="nowriafisda"
                    className={`w-full px-12 py-3 font-brand text-black placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all duration-300 group-hover:bg-white ${errors.username
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:bg-white"
                      }`}
                    {...register("username", {
                      required: "Username is required",
                      minLength: {
                        value: 3,
                        message: "Username must be at least 3 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_]+$/,
                        message:
                          "Username can only contain letters, numbers, and underscores",
                      },
                    })}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaUser className="text-gray-400 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
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
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="nowriafisda@cookeasy.com"
                    className={`w-full px-12 py-3 font-brand text-black placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all duration-300 group-hover:bg-white ${errors.email
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
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
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

              {/* Role Selection Field */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Join as
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center cursor-pointer group p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/20 transition-all duration-300 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50/30">
                    <input
                      type="radio"
                      value="user"
                      className="w-4 h-4 text-orange-700 bg-gray-100 border-gray-300 focus:ring-orange-700 focus:ring-2 transition-all duration-300"
                      {...register("role", {
                        required: "Please select your role",
                      })}
                      defaultChecked
                    />
                    <div className="ml-3 flex items-center">
                      <FaHeart className="text-orange-400 mr-2 group-hover:text-orange-500 transition-colors duration-300" />
                      <div>
                        <span className="block text-sm font-medium text-orange-50 group-hover:text-orange-200 transition-colors duration-300">
                          Food Lover
                        </span>
                        <span className="block text-xs text-orange-200 opacity-80">
                          Discover amazing recipes
                        </span>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center cursor-pointer group p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50/20 transition-all duration-300 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50/30">
                    <input
                      type="radio"
                      value="chef"
                      className="w-4 h-4 text-orange-700 bg-gray-100 border-gray-300 focus:ring-orange-700 focus:ring-2 transition-all duration-300"
                      {...register("role", {
                        required: "Please select your role",
                      })}
                    />
                    <div className="ml-3 flex items-center">
                      <FaUtensils className="text-orange-400 mr-2 group-hover:text-orange-500 transition-colors duration-300" />
                      <div>
                        <span className="block text-sm font-medium text-orange-50 group-hover:text-orange-200 transition-colors duration-300">
                          Chef
                        </span>
                        <span className="block text-xs text-orange-200 opacity-80">
                          Share your recipes
                        </span>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
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
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={`w-full px-12 py-3 font-brand text-black placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all duration-300 group-hover:bg-white ${errors.password
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
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-normal font-brand text-orange-600">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`w-full px-12 py-3 font-brand text-black placeholder-gray-400 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-700 focus:border-transparent transition-all duration-300 group-hover:bg-white ${errors.confirmPassword
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:bg-white"
                      }`}
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-gray-400 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-700 transition-colors duration-300 p-1"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1">
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
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="space-y-2">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-orange-700 bg-gray-100 border-gray-300 rounded focus:ring-orange-700 focus:ring-2 transition-all duration-300"
                    {...register("terms", {
                      required: "You must agree to the terms and conditions",
                    })}
                  />
                  <span className="ml-3 text-sm font-brand font-medium text-orange-50 transition-colors duration-300">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-sm font-brand font-medium text-orange-50 transition-colors duration-300"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-sm font-brand font-medium text-orange-50 transition-colors duration-300"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-red-500 text-sm font-medium flex items-center gap-1 ml-7">
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
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-50 hover:bg-orange-100 text-orange-800 font-semibold font-brand py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center bg-orange-50">
                    <LoadingSpinner size="sm" text="" />
                    <span className="ml-2">Creating Account ...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 rounded-xl bg-orange-50 text-orange-800 font-medium font-brand text-xs">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm hover:shadow-md bg-white hover:bg-gray-50 transition-all duration-300 group">
                  <FaGoogle className="text-red-500 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 font-medium">Google</span>
                </button>
                <button className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm hover:shadow-md bg-white hover:bg-gray-50 transition-all duration-300 group">
                  <FaFacebook className="text-blue-600 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-gray-700 font-medium">Facebook</span>
                </button>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-orange-50 font-brand text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="ml-1 font-semibold text-sm text-orange-500 hover:text-orange-600 hover:underline transition-all duration-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;