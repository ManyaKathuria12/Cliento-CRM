import { useState } from "react";
import { Lock, Shield, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import { authFetch } from "@/utils/api";

interface SecurityTabProps {
  user: any;
}

interface Session {
  id: string;
  device: string;
  os: string;
  location: string;
  ip: string;
  current: boolean;
  icon: typeof Monitor | typeof Smartphone;
}

const activeSessions: Session[] = [
  {
    id: "s1",
    device: "Windows PC",
    os: "Chrome Browser",
    location: "Mumbai, India",
    ip: "192.168.1.42",
    current: true,
    icon: Monitor,
  },
  {
    id: "s2",
    device: "iPhone 15",
    os: "Cliento Mobile App",
    location: "New Delhi, India",
    ip: "103.45.21.90",
    current: false,
    icon: Smartphone,
  },
];

export default function SecurityTab({ user }: SecurityTabProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all password fields ❌");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match ❌");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters long ❌");
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Updating password...");

    try {
      const response = await authFetch(`/auth/change-password/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update password");

      toast.dismiss(loadingToast);
      toast.success("Password changed successfully! ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to change password ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <form onSubmit={handlePasswordChange} className="glass rounded-2xl p-6 border border-border/50 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield size={20} className="text-primary" /> Security Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your credentials and account safety</p>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              CURRENT PASSWORD
            </label>
            <div className="relative">
              <input
                type={showOld ? "text" : "password"}
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2.5 pr-10 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              NEW PASSWORD
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 pr-10 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              CONFIRM NEW PASSWORD
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 pr-10 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-start">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm flex items-center gap-2 cursor-pointer"
          >
            <Lock size={14} /> Change Password
          </button>
        </div>
      </form>

      {/* Active Sessions Card */}
      <div className="glass rounded-2xl p-6 border border-border/50 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Active Device Sessions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Devices currently signed into your CRM account</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeSessions.map((session) => {
            const SessionIcon = session.icon;
            return (
              <div key={session.id} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-secondary/20 border border-border/20 text-xs">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0 border border-border/30">
                  <SessionIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{session.device}</p>
                  <p className="text-muted-foreground truncate">{session.os} &bull; {session.location}</p>
                  <p className="text-[10px] text-muted-foreground/70 font-mono mt-0.5">{session.ip}</p>
                </div>
                {session.current && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                    Current Device
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
