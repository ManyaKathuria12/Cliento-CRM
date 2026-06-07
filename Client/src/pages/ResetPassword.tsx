import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!password) return alert("Enter password");

    try {
      await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      alert("Password updated ✅");
      navigate("/login");
    } catch {
      alert("Error ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">

      <div className="glass p-6 rounded-2xl w-full max-w-sm space-y-4">

        <h2 className="text-xl font-bold text-center">
          Reset Password
        </h2>

        <div className="relative">
          <Lock className="absolute left-3 top-3" size={16} />

          <input
            type={show ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 py-2 rounded-xl bg-secondary border border-border"
          />

          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-2"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full bg-primary text-primary-foreground py-2 rounded-xl"
        >
          Update Password
        </button>

      </div>
    </div>
  );
};

export default ResetPassword;