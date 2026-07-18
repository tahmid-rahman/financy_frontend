import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../contexts/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";

// Use environment variable with fallback for OAuth endpoints
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error: any) {
      // Handle different error formats from backend
      let errorMessage = "Login failed";

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.detail) {
        errorMessage = error.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // DRF serializer errors come as objects like {email: [...], password: [...]}
        const messages = Object.values(error as Record<string, unknown>).flat().filter(Boolean);
        if (messages.length > 0 && typeof messages[0] === 'string') {
          errorMessage = messages[0];
        }
      }

      setApiError(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    // Backend OAuth entrypoint lives under /api/accounts/auth/google/
    const base = API_BASE_URL.replace(/\/$/, "");
    window.location.href = `${base}/accounts/auth/google/`;
  };

  const handleGithubLogin = () => {
    // Backend OAuth entrypoint lives under /api/accounts/auth/github/
    const base = API_BASE_URL.replace(/\/$/, "");
    window.location.href = `${base}/accounts/auth/github/`;
  };

  const handleForgotPasswordSuccess = () => {
    setIsForgotPasswordOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="p-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-300% animate-gradient"
          >
            Welcome Back
          </motion.h2>
          <p className="mt-2 text-text-muted">Sign in to continue your financial journey</p>
        </div>
        {/* Form Fields */}
        <div className="space-y-6">
          {/* Email Field */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
                <FiMail />
              </div>
              <input
                type="email"
                {...register("email")}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-border focus:border-primary focus:outline-none transition-colors text-text"
              />
            </div>
            {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>}
          </motion.div>

          {/* Password Field */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
                <FiLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-3 bg-transparent border-b border-border focus:border-primary focus:outline-none transition-colors text-text"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
          </motion.div>

          {/* Forgot Password Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-right"
          >
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-sm text-primary hover:underline underline-offset-4"
            >
              Forgot password?
            </button>
          </motion.div>
        </div>
        {apiError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mb-4">
            {apiError}
          </motion.div>
        )}
        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-lg hover:shadow-primary/30 transition-all group disabled:opacity-50"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Signing in..." : "Sign In"}</span>
            <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center my-8"
        >
          <div className="flex-1 border-t border-border"></div>
          <span className="px-4 text-text-muted text-sm">OR</span>
          <div className="flex-1 border-t border-border"></div>
        </motion.div>

        {/* Social Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row justify-between gap-4 w-full"
        >
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center w-full justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-text"
          >
            <FcGoogle className="text-lg" />
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex items-center w-full justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-text"
          >
            <FaGithub className="text-lg" />
            <span>GitHub</span>
          </button>
        </motion.div>

        {/* Footer Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-text-muted"
        >
          Don't have an account?{" "}
          <a href="/signup" className="text-primary hover:underline underline-offset-4">
            Sign up
          </a>
        </motion.p>
      </form>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccess={handleForgotPasswordSuccess}
      />
    </>
  );
};