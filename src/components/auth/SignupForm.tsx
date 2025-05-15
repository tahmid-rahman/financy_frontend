import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupFormData) => {
    console.log(data);
    // API integration would go here
  };

  const password = watch("password");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-300% animate-gradient"
        >
          Join Financy
        </motion.h2>
        <p className="mt-2 text-text-muted">Start your financial journey today</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Name Field */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
              <FiUser />
            </div>
            <input
              {...register("name")}
              placeholder="Full name"
              className="w-full pl-10 pr-4 py-3 bg-transparent border-b border-border focus:border-primary focus:outline-none transition-colors text-text"
            />
          </div>
          {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name.message}</span>}
        </motion.div>

        {/* Email Field */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
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
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
              <FiLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password (6+ characters)"
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
          {password && (
            <div className="mt-2">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    password.length < 6 ? "bg-red-500" : password.length < 8 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(100, (password.length / 12) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {errors.password && <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>}
        </motion.div>

        {/* Confirm Password Field */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary">
              <FiLock />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm password"
              className="w-full pl-10 pr-10 py-3 bg-transparent border-b border-border focus:border-primary focus:outline-none transition-colors text-text"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
          )}
        </motion.div>
      </div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-10"
      >
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-lg hover:shadow-primary/30 transition-all group"
          disabled={Object.keys(errors).length > 0}
        >
          <span>Create Account</span>
          <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center my-8"
      >
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-text-muted text-sm">OR</span>
        <div className="flex-1 border-t border-border"></div>
      </motion.div>

      {/* Social Login - Improved Design */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row justify-between gap-4 w-full"
      >
        <button
          type="button"
          className="flex items-center w-full justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-text"
        >
          <FcGoogle className="text-lg" />
          <span>Google</span>
        </button>

        <button
          type="button"
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
        transition={{ delay: 0.9 }}
        className="mt-8 text-center text-sm text-text-muted"
      >
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline underline-offset-4 decoration-from-font">
          Sign in
        </a>
      </motion.p>
    </form>
  );
};
