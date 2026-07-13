import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Contact, Handshake, CheckSquare,
  BarChart3, Bell, MessageSquare, LogOut
} from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { getAuthHeaders, API_BASE_URL } from "@/utils/api";



const getNavItems = (role) => {
    if (role === "admin") {
    return [
      { label: "Admin Dashboard", path: "/admin" },
      { label: "Users", path: "/admin/users" }, 
    ];
  }

  if (role === "manager") {
    return [
      { label: "Dashboard", path: "/manager" },
      { label: "Pipeline", path: "/pipeline" },
      { label: "Deals", path: "/deals" },
      { label: "Analytics", path: "/analytics" },
    ];
  }

  // sales
  return [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Leads", path: "/leads" },
    { label: "Contacts", path: "/contacts" },
    { label: "Pipeline", path: "/pipeline" },
    { label: "Deals", path: "/deals" },
    { label: "Tasks", path: "/tasks" },
  ];
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const [customToast, setCustomToast] = useState<string | null>(null);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (e) {
      console.log("Error loading notifications in layout:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(API_BASE_URL, { transports: ["websocket"], withCredentials: true });
    
    socket.on("dashboardUpdated", () => {
      fetchNotifications();
    });

    socket.on("tasksUpdated", () => {
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      fetchNotifications();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("localNotificationsUpdated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("localNotificationsUpdated", handleStorage);
    };
  }, []);

  // Display toast alerts for new unread notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      const id = latest._id || latest.id;
      if (lastNotificationId && id !== lastNotificationId && !latest.read) {
        toast(`${latest.title}: ${latest.description}`, {
          icon: '🔔',
          duration: 4000
        });
      }
      setLastNotificationId(id);
    }
  }, [notifications, lastNotificationId]);

  const unreadNotes = notifications.filter((n: any) => !n.read);
  const unreadCount = unreadNotes.length;

  const hasOverdue = unreadNotes.some((n: any) => n.title?.includes("Overdue"));
  const hasHighPriority = unreadNotes.some((n: any) => n.priority === "high");

  let badgeColor = "bg-green-500";
  if (hasOverdue || hasHighPriority) {
    badgeColor = "bg-red-500";
  } else if (unreadCount > 0) {
    badgeColor = "bg-yellow-400";
  }

  const role = user?.role || "sales";
  const navItems = getNavItems(role);


  // 🔥 LOGOUT
  const handleLogout = () => {
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  const handleProfileMenuAction = (path: string) => {
    setShowUserMenu(false);
    navigate(path);
  };

  const confirmLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  // 🔥 INITIALS
  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="min-h-screen bg-background">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 h-16 border-b border-border/50 flex items-center px-8 bg-card/80 backdrop-blur-sm shadow-sm">

        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Logo size="sm" />
        </div>

        {/* CENTER NAV */}
        <div className="flex-1 flex justify-center">
          <nav className="flex items-center gap-8">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-all ${
                    active
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5 ml-auto">

          {/* 🔔 Notification */}
        <div className="relative flex items-center notification-box">
 <button
  onClick={() => navigate("/notifications")}
  className="relative p-2 rounded-xl hover:bg-secondary transition-colors"
>
  <Bell />

  {unreadCount > 0 && (
  <span
    className={`absolute -top-1 -right-1 ${badgeColor} text-[10px] px-1.5 py-0.5 rounded-full font-semibold`}
  >
    {unreadCount}
  </span>
)}
</button>
</div>

          {/* 👤 USER NAME */}
<div className="relative">
  <button
    type="button"
    onClick={() => setShowUserMenu((prev) => !prev)}
    className="flex items-center gap-2 cursor-pointer"
  >
    <span
      className={`text-sm font-medium hidden sm:block transition-all duration-200 ${
        showUserMenu || location.pathname === "/profile"
          ? "text-primary"
          : "text-muted-foreground hover:text-primary"
      }`}
    >
      {user?.name || "User"}
    </span>

    {user?.avatar ? (
      <img
        src={`${API_BASE_URL}/uploads/${user.avatar}`}
        alt={`${user?.name || "User"} avatar`}
        className="w-9 h-9 rounded-xl object-cover"
      />
    ) : (
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-black font-bold">
        {initials}
      </div>
    )}
  </button>

  {showUserMenu && (
    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-2 z-50">
      <button
        type="button"
        onClick={() => handleProfileMenuAction("/settings")}
        className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
      >
        Settings
      </button>
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
      >
        Logout
      </button>
    </div>
  )}
</div>

          {/* 🚪 LOGOUT */}
          <button
            onClick={handleLogout}
           className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-secondary transition-all"
          >
            <LogOut size={16} />
            <span className="text-sm">Logout</span>
          </button>

        </div>
      </header>

      {/* MAIN */}
      <main className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

   {customToast && (
  <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right fade-in z-50">

    {/* dot */}
    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>

    {/* text */}
    <p className="text-sm font-medium">{customToast}</p>

    {/* close button (optional) */}
    <button
      onClick={() => setCustomToast("")}
      className="text-xs text-muted-foreground hover:text-white ml-2"
    >
      ✕
    </button>

  </div>
)}

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

    </div>
  );
};

export default DashboardLayout;