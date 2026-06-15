import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import KPICard from "@/components/KPICard";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, Building, Briefcase, MapPin, Calendar, 
  Edit, Save, X, Lock, Shield, Activity, Bell, Trash2, LogOut, 
  Monitor, Smartphone, Check, Users, Handshake, CheckSquare, Contact,
  Clock, Camera
} from "lucide-react";
import { authFetch } from "../utils/api";

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

const categoryIcons: Record<string, typeof Users | typeof Handshake | typeof CheckSquare | typeof Contact> = {
  lead: Users,
  deal: Handshake,
  task: CheckSquare,
  contact: Contact,
};

const formatActivityTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [company, setCompany] = useState(user?.company || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [location, setLocation] = useState(user?.location || "");

  // Preferences
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefBrowser, setPrefBrowser] = useState(true);
  const [prefWeekly, setPrefWeekly] = useState(false);
  const [prefAlerts, setPrefAlerts] = useState(true);

  // Security Toggles & Passwords
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [stats, setStats] = useState<{
    leadsCount: number;
    dealsCount: number;
    contactsCount: number;
    completedTasksCount: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const fetchStats = (userId: string, active: boolean) => {
    authFetch(`/auth/profile-stats/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setStats(data);
          setStatsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fetch stats error:", err);
        if (active) setStatsLoading(false);
      });
  };

  const fetchActivities = (userId: string, active: boolean) => {
    authFetch(`/auth/profile-activity/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch activities");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setActivities(data);
          setActivitiesLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fetch activities error:", err);
        if (active) setActivitiesLoading(false);
      });
  };

  // Fetch fresh profile from database on mount
  useEffect(() => {
    if (!user?._id) return;
    let active = true;

    authFetch(`/auth/profile/${user._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        if (active) {
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setCompany(data.company || "");
          setJobTitle(data.jobTitle || "");
          setLocation(data.location || "");

          // Update context & localStorage in real-time
          const updatedUser = {
            ...user,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            role: data.role,
            phone: data.phone || "",
            company: data.company || "",
            jobTitle: data.jobTitle || "",
            location: data.location || "",
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      })
      .catch((err) => {
        console.error("Fetch profile error:", err);
      });

    setStatsLoading(true);
    setActivitiesLoading(true);
    fetchStats(user._id, active);
    fetchActivities(user._id, active);

    return () => {
      active = false;
    };
  }, [user?._id]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const loadingToast = toast.loading("Uploading picture...");

    try {
      const uploadRes = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload avatar to server");
      }

      const { file: filename } = await uploadRes.json();

      const updateRes = await authFetch(`/auth/profile/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatar: filename,
        }),
      });

      if (!updateRes.ok) {
        throw new Error("Failed to save avatar database changes");
      }

      const updatedUserRes = await updateRes.json();

      const updatedUser = {
        ...user,
        avatar: updatedUserRes.avatar,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.dismiss(loadingToast);
      toast.success("Profile picture updated successfully!");
      fetchStats(user._id, true);
      fetchActivities(user._id, true);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to update profile picture ❌");
    }
  };

  const handleSaveInfo = async () => {
    if (!name || !email) {
      toast.error("Name and Email are required");
      return;
    }

    try {
      const response = await authFetch(`/auth/profile/${user?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          jobTitle,
          location,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      const updatedUser = {
        ...user,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        company: data.company || "",
        jobTitle: data.jobTitle || "",
        location: data.location || "",
        avatar: data.avatar,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      fetchStats(user._id, true);
      fetchActivities(user._id, true);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile ❌");
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setCompany(user?.company || "");
    setJobTitle(user?.jobTitle || "");
    setLocation(user?.location || "");
    setIsEditing(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

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
      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password changed successfully! ✅");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password ❌");
    }
  };

  const confirmLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const confirmDeleteAccount = () => {
    logout();
    toast.success("Account deleted permanently");
    navigate("/");
  };

  // Avatar initials helper
  const initials =
    name?.charAt(0)?.toUpperCase() ||
    email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="space-y-8 w-full max-w-full px-6 lg:px-8 pb-12">
      {/* SECTION 1 — PROFILE HEADER */}
      <div className="glass rounded-2xl p-6 border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
            title="Click to change profile picture"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
            {user?.avatar ? (
              <img
                src={user.avatar.startsWith("http") ? user.avatar : `http://localhost:5000/uploads/${user.avatar}`}
                className="w-24 h-24 rounded-full object-cover border-2 border-primary group-hover:opacity-75 transition-opacity"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-black font-extrabold text-3xl group-hover:opacity-75 transition-opacity">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:opacity-90 border border-background">
              <Camera size={14} />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold text-foreground">{name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                {user?.role || "Sales Representative"}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{email}</p>
            <p className="text-xs text-muted-foreground/80 flex items-center justify-center sm:justify-start gap-1">
              <Calendar size={12} /> Member since June 2026
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-foreground hover:bg-secondary transition-all cursor-pointer font-medium text-sm"
            >
              <Edit size={16} className="text-primary" /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveInfo}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold hover:opacity-90 transition-all cursor-pointer text-sm"
              >
                <Save size={16} /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/40 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer text-sm"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3 — ACCOUNT STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Leads Created" 
          value={statsLoading ? "..." : (stats?.leadsCount ?? 0).toString()} 
          change="12%" 
          changeType="up" 
          icon={Users} 
        />
        <KPICard 
          title="Total Deals Managed" 
          value={statsLoading ? "..." : (stats?.dealsCount ?? 0).toString()} 
          change="8%" 
          changeType="up" 
          icon={Handshake} 
        />
        <KPICard 
          title="Tasks Completed" 
          value={statsLoading ? "..." : (stats?.completedTasksCount ?? 0).toString()} 
          change="25%" 
          changeType="up" 
          icon={CheckSquare} 
        />
        <KPICard 
          title="Contacts Added" 
          value={statsLoading ? "..." : (stats?.contactsCount ?? 0).toString()} 
          change="15%" 
          changeType="up" 
          icon={Contact} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PERSONAL INFO & PREFERENCES */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 2 — PERSONAL INFORMATION CARD */}
          <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <User size={18} className="text-primary" /> Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <User size={12} /> FULL NAME
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/20">
                    {name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Mail size={12} /> EMAIL ADDRESS
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/20">
                    {email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Phone size={12} /> PHONE NUMBER
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/20">
                    {phone}
                  </p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Building size={12} /> COMPANY
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/20">
                    {company}
                  </p>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Briefcase size={12} /> JOB TITLE
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/20">
                    {jobTitle}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <MapPin size={12} /> LOCATION
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-sm font-semibold text-foreground bg-secondary/20 p-2.5 rounded-xl border border-border/20">
                    {location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 6 — PREFERENCES */}
          <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Bell size={18} className="text-primary" /> Notification Preferences
              </h3>
            </div>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive real-time email alerts for CRM activities.</p>
                </div>
                <button
                  onClick={() => setPrefEmail(!prefEmail)}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    prefEmail ? "bg-primary" : "bg-muted border border-border"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      prefEmail ? "left-6 bg-primary-foreground" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">Browser Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Show popup banners in your system tray.</p>
                </div>
                <button
                  onClick={() => setPrefBrowser(!prefBrowser)}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    prefBrowser ? "bg-primary" : "bg-muted border border-border"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      prefBrowser ? "left-6 bg-primary-foreground" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Weekly Reports */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">Weekly Digest Reports</p>
                  <p className="text-xs text-muted-foreground">Get a structured Monday morning performance report.</p>
                </div>
                <button
                  onClick={() => setPrefWeekly(!prefWeekly)}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    prefWeekly ? "bg-primary" : "bg-muted border border-border"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      prefWeekly ? "left-6 bg-primary-foreground" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* CRM Activity Alerts */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">CRM Activity Alerts</p>
                  <p className="text-xs text-muted-foreground">Notify when team members update deals or leads.</p>
                </div>
                <button
                  onClick={() => setPrefAlerts(!prefAlerts)}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    prefAlerts ? "bg-primary" : "bg-muted border border-border"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      prefAlerts ? "left-6 bg-primary-foreground" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY, ACTIONS, AND ACTIVITY */}
        <div className="space-y-6">
          {/* SECTION 4 — SECURITY SETTINGS */}
          <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield size={18} className="text-primary" /> Security Settings
              </h3>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground">UPDATE PASSWORD</p>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-muted text-sm font-semibold transition cursor-pointer"
                >
                  <Lock size={14} /> Update Password
                </button>
              </div>
            </form>

            <div className="border-t border-border/40 pt-4 space-y-4">
              {/* 2FA UI Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">Two-Factor Auth (2FA)</p>
                  <p className="text-xs text-muted-foreground">Strengthen login security</p>
                </div>
                <button
                  onClick={() => {
                    setTfaEnabled(!tfaEnabled);
                    toast.success(`Two-factor Authentication ${!tfaEnabled ? "Enabled" : "Disabled"}`);
                  }}
                  className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                    tfaEnabled ? "bg-primary" : "bg-muted border border-border"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      tfaEnabled ? "left-6 bg-primary-foreground" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Sessions</p>
                <div className="space-y-2">
                  {activeSessions.map((session) => {
                    const SessionIcon = session.icon;
                    return (
                      <div key={session.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/20 border border-border/20 text-xs">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <SessionIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{session.device}</p>
                          <p className="text-muted-foreground truncate">{session.os} &bull; {session.location}</p>
                        </div>
                        {session.current && (
                          <span className="text-[10px] font-bold text-primary shrink-0 bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — RECENT ACTIVITY */}
          <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Activity size={18} className="text-primary" /> Recent Activity
              </h3>
            </div>

            <div className="space-y-3">
              {activitiesLoading ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Loading activities...
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/40 rounded-xl">
                  No recent activities recorded.
                </div>
              ) : (
                activities.map((act) => {
                  const ActIcon = categoryIcons[act.category] || Activity;
                  return (
                    <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-secondary/10 text-xs">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${act.colorClass}`}>
                        <ActIcon size={14} />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="font-bold text-foreground">{act.title}</p>
                        <p className="text-muted-foreground leading-relaxed">{act.desc}</p>
                        <p className="text-[10px] text-muted-foreground/80 flex items-center gap-1">
                          <Clock size={10} /> {formatActivityTime(act.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 7 — ACCOUNT ACTIONS */}
          <div className="glass rounded-2xl p-6 border border-border/50 space-y-4">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/50 border border-border text-foreground hover:bg-secondary/80 font-bold transition text-sm cursor-pointer"
            >
              <LogOut size={16} /> Logout
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/25 font-bold transition text-sm cursor-pointer"
            >
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <h2 className="text-xl font-bold text-foreground">Logout</h2>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 bg-secondary border border-border text-foreground hover:bg-muted py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-destructive text-white hover:opacity-90 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <h2 className="text-xl font-bold text-destructive">Delete Account</h2>
              <p className="text-sm text-muted-foreground">
                Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-secondary border border-border text-foreground hover:bg-muted py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="flex-1 bg-destructive text-white hover:opacity-90 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;