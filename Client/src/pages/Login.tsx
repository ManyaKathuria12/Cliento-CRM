import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuth();

  // 🔐 LOGIN / SIGNUP
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed ❌");
      return;
    }

    // 🔥 user save
    localStorage.setItem("user", JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    // 🔥 role-based redirect
    if (data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }

  } catch (err) {
    alert("Error ❌");
  }
};

  // 🔥 GOOGLE LOGIN (FINAL FIXED)
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // 1️⃣ Get Google user
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const googleUser = await res.json();

        // 2️⃣ Send to backend
        const backendRes = await fetch("http://localhost:5000/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleUser),
        });

        const data = await backendRes.json();

        // 3️⃣ Save properly (_id included)
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("GOOGLE USER:", data.user);

        toast({ title: "Google login success ✅" });
      if (data.user.role === "admin") {
  navigate("/admin");
} else if (data.user.role === "manager") {
  navigate("/manager");
} else {
  navigate("/dashboard");
}

      } catch (err) {
        console.log("GOOGLE LOGIN ERROR:", err);
        toast({
          title: "Google login failed ❌",
          variant: "destructive",
        });
      }
    },
  });

  // 🔥 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter email first ⚠️" });
      return;
    }

    try {
      await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      toast({ title: "Reset link sent 📩" });
    } catch {
      toast({ title: "Error ❌", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative">

      <div className="absolute top-6 left-8">
        <Logo size="sm" />
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-5 glass glow-cyan p-6 rounded-2xl"
        >

          <h1 className="text-2xl font-bold text-center">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>

          {/* GOOGLE */}
          <button
            onClick={() => {
              console.log("GOOGLE CLICK 🔥");
    googleLogin();
            }}
            className="w-full flex items-center justify-center gap-3 py-2 rounded-xl border border-border bg-card hover:bg-secondary transition-all"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
            />
            <span className="text-sm font-medium">
              {isSignup ? "Continue with Google" : "Log in with Google"}
            </span>
          </button>

          <div className="text-center text-sm text-muted-foreground">or</div>

        <form onSubmit={handleSubmit} className="space-y-4">

            {isSignup && (
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full p-2 rounded-xl bg-secondary border border-border"
              />
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 py-2 rounded-xl bg-secondary border border-border"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3" size={16} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 py-2 rounded-xl bg-secondary border border-border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isSignup && (
              <div className="flex justify-between text-sm">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                  />{" "}
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary"
                >
                  Forgot password?
                </button>
              </div>
            )}

         <button
  type="submit"
  className="w-full bg-primary text-white py-2 rounded-xl"
>
  {isSignup ? "Sign Up" : "Sign In"}
</button>

          </form>

          <p className="text-center text-sm">
            <button onClick={() => setIsSignup(!isSignup)}>
              {isSignup
                ? "Already have an account? Login"
                : "Create Account"}
            </button>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;