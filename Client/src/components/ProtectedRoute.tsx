import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, roleRequired }: any) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Role mismatch check
  if (roleRequired) {
    const roles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
    if (!roles.includes(user.role)) {
      if (user.role === "admin") {
        return <Navigate to="/admin" replace />;
      } else if (user.role === "manager") {
        return <Navigate to="/manager" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;