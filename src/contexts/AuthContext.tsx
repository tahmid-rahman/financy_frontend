import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { api, tokenStorage } from "../services/api";

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

  const logout = useCallback(() => {
    tokenStorage.clear();
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/accounts/login/", { email, password });
    const data = response.data?.data || response.data;
    const { token, name, email: userEmail } = data;

    // Save token and user data
    tokenStorage.set(token);
    localStorage.setItem("name", name);
    localStorage.setItem("email", userEmail);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    setUser({ name, email: userEmail });
  };

  // Update token when it changes (e.g., after password change)
  const updateToken = (token: string) => {
    tokenStorage.set(token);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  };

  // Handle token expired events from API interceptor
  useEffect(() => {
    const handleTokenExpired = () => {
      logout();
      // Optionally redirect to login with message
      window.location.href = "/login?session_expired=1";
    };

    window.addEventListener("auth:token-expired", handleTokenExpired);
    return () => window.removeEventListener("auth:token-expired", handleTokenExpired);
  }, [logout]);

  // Initialize auth state from localStorage or OAuth URL params
  useEffect(() => {
    // Check URL params first (from OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get("oauth_token");

    if (oauthToken) {
      // OAuth token received - fetch user profile to get name/email
      tokenStorage.set(oauthToken, true); // Mark as OAuth token
      api.defaults.headers.common["Authorization"] = `Token ${oauthToken}`;

      // Fetch user profile
      api.get("/accounts/user-profile/")
        .then((profileResponse) => {
          const profileData = profileResponse.data?.data || profileResponse.data;
          const name = profileData?.name || profileData?.email?.split("@")[0] || "";
          const email = profileData?.email || "";
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          setUser({ name, email });
        })
        .catch(() => {
          // OAuth token invalid, clear it
          logout();
        })
        .finally(() => {
          // Clean URL without reloading
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          setLoading(false);
        });
      return;
    }

    // Check localStorage for existing session
    const token = tokenStorage.get();
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (token && email) {
      api.defaults.headers.common["Authorization"] = `Token ${token}`;
      setUser({ name: name || "", email });
    }
    setLoading(false);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};