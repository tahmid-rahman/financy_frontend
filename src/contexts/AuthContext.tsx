// src/contexts/AuthContext.tsx
import { createContext, useContext, ReactNode, useState } from "react";

type AuthContextType = {
  user: { name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>({ name: "John Doe" });

  const login = async (email: string, password: string) => {
    // Your login logic
    setUser({ name: "John Doe" });
  };

  const logout = () => setUser(null);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
