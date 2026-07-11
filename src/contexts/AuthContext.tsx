import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { api } from "../services/api";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateToken: (token: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const login = async (email: string, password: string) => {
    const response = await api.post("/accounts/login/", { email, password });
    const { token, name, email: userEmail } = response.data;

    // Save token and user data
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    localStorage.setItem("email", userEmail);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    setUser({ name, email: userEmail });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // Update token when it changes (e.g., after password change)
  const updateToken = (token: string) => {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  };

  // Restore from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (token && name && email) {
      api.defaults.headers.common["Authorization"] = `Token ${token}`;
      setUser({ name, email });
    }
    setLoading(false);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout, loading, updateToken }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};