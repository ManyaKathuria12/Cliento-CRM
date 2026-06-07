import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, roleRequired }: any) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ❌ Role mismatch
  if (roleRequired && user.role !== roleRequired) {
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} />;
}

  // ✅ Allowed
  return children;
};

export default ProtectedRoute;