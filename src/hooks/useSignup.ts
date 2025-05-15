import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const useSignup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const signup = async (data: SignupData) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.post("/auth/register/", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      navigate("/dashboard"); // Redirect after successful signup
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};
