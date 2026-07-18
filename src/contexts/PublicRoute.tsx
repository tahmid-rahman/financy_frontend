import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Spinner } from "../components/ui/Spinner";

interface PublicRouteProps {
  children: JSX.Element;
}

export const PublicRoute = ({ children }: PublicRouteProps): JSX.Element => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  // If user is logged in, redirect to dashboard
  return user ? <Navigate to="/dashboard" replace /> : children;
};