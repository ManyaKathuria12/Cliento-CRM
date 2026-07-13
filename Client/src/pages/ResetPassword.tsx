import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="glass p-8 rounded-2xl w-full max-w-sm space-y-4 text-center">
        <h2 className="text-xl font-bold">Password Reset Unavailable</h2>
        <p className="text-sm text-muted-foreground">
          Password reset is disabled in this demo portfolio. Please contact your system administrator or log in with Google.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold hover:opacity-90 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;