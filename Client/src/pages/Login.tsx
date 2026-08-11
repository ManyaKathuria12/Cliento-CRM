import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from "@/utils/api";

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
    setIsLoading(true);

    try {
      const endpoint = isSignup ? `${API_BASE_URL}/api/auth/signup` : `${API_BASE_URL}/api/auth/login`;
      const body = isSignup 
        ? { name: fullName, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.message || "Failed ❌", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (isSignup) {
        // Auto-login after successful signup
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          toast({ title: loginData.message || "Auto-login failed ❌", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        if (loginData.user) {
          localStorage.setItem("user", JSON.stringify(loginData.user));
          setUser(loginData.user);
        }
        if (loginData.token) {
          localStorage.setItem("token", loginData.token);
        }
        toast({ title: "Account created and logged in! 🎉" });
        navigate(loginData.user?.role === "admin" ? "/admin" : "/dashboard");
      } else {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        toast({ title: "Welcome back! 👋" });
        navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
      }

    } catch (err) {
      toast({ title: "Error occurred ❌", variant: "destructive" });
    } finally {
      setIsLoading(false);
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
        const backendRes = await fetch(`${API_BASE_URL}/api/auth/google`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(googleUser),
        });

        const data = await backendRes.json();

        // 3️⃣ Save properly (_id included)
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
        }

        console.log("GOOGLE USER:", data.user);

        toast({ title: "Google login success ✅" });
        if (data.user?.role === "admin") {
          navigate("/admin");
        } else if (data.user?.role === "manager") {
          navigate("/manager");
        } else if (data.user) {
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
  const handleForgotPassword = () => {
    toast({
      title: "Password Reset Unavailable ⚠️",
      description: "Password reset is disabled in this demo. Please use Google Login or contact the system administrator.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">

      {/* ✨ Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orb 1 — teal, top left */}
        <div style={{
          position: "absolute", top: "-10%", left: "-10%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "orbFloat1 12s ease-in-out infinite",
        }} />
        {/* Orb 2 — cyan, bottom right */}
        <div style={{
          position: "absolute", bottom: "-15%", right: "-10%",
          width: "550px", height: "550px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
          filter: "blur(70px)",
          animation: "orbFloat2 15s ease-in-out infinite",
        }} />
        {/* Orb 3 — purple, top right */}
        <div style={{
          position: "absolute", top: "10%", right: "5%",
          width: "350px", height: "350px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orbFloat3 18s ease-in-out infinite",
        }} />
        {/* Orb 4 — teal, center bottom */}
        <div style={{
          position: "absolute", bottom: "5%", left: "30%",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)",
          filter: "blur(45px)",
          animation: "orbFloat1 20s ease-in-out infinite reverse",
        }} />
      </div>

      {/* CSS Keyframes injected inline */}
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -30px) scale(1.05); }
          66%       { transform: translate(-20px, 40px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-50px, 30px) scale(1.08); }
          66%       { transform: translate(30px, -40px) scale(0.95); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%       { transform: translate(-30px, 50px) scale(1.1); }
        }
      `}</style>

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
              <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 py-2 rounded-xl bg-secondary border border-border"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={16} />
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
                {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
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