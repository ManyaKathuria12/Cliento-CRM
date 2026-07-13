import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminRoute({ children }: any) {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}