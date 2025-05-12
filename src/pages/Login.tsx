import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { Loader2 } from "lucide-react";

// Schema validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      // Mock API call (replace with your actual endpoint)
      const response = await axios.post("https://api.yourdomain.com/auth/login", data);

      // Store token (example using localStorage)
      localStorage.setItem("authToken", response.data.token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(axios.isAxiosError(err) ? err.response?.data.message || "Login failed" : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Welcome Back</h1>
            <p className="text-text-muted">Enter your credentials to access your account</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-600 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.email ? "border-red-500" : "border-border"
                } focus:ring-2 focus:ring-primary focus:border-transparent`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-text">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className={`w-full px-4 py-2.5 rounded-lg border ${
                  errors.password ? "border-red-500" : "border-border"
                } focus:ring-2 focus:ring-primary focus:border-transparent`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-surface font-medium rounded-lg transition-colors flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            Don't have an account?{" "}
            <a href="/signup" className="text-primary hover:text-primary-dark font-medium">
              Sign up
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-text-muted">
          By continuing, you agree to our{" "}
          <a href="#" type="button" className="underline text-primary hover:text-primary-dark">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
