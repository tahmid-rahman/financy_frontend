import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Spinner } from "../components/ui/Spinner";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const { user, loading } = useAuth();

  if (loading) {
    return <>Loading...</>;
  }

  return user ? children : <Navigate to="/login" replace />;
};
