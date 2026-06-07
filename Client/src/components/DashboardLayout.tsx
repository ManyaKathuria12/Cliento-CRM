import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Contact, Handshake, CheckSquare,
  BarChart3, Settings, Bell, MessageSquare, LogOut
} from "lucide-react";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";



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
      { label: "Deals", path: "/deals" },
      { label: "Analytics", path: "/analytics" },
    ];
  }

  // sales
  return [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Leads", path: "/leads" },
    { label: "Contacts", path: "/contacts" },
    { label: "Deals", path: "/deals" },
    { label: "Tasks", path: "/tasks" },
  ];
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
const [notifications, setNotifications] = useState<
  { id: string; text: string; type: string }[]
>([]);
const [readNotifications, setReadNotifications] = useState<string[]>(() => {
  const saved = localStorage.getItem("readNotifications");
  return saved ? JSON.parse(saved) : [];
});
const importantNotifications = notifications.filter(
  (n) =>
    n.type?.toLowerCase() !== "upcoming" &&
    !readNotifications.includes(n.id)
);
const [lastToastId, setLastToastId] = useState<string | null>(null);


const isOverdue = (date: string) => {
  return new Date(date + "T00:00:00") < new Date();
};

const generateNotifications = (data: any) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notes: { id: string; text: string; type: string }[] = [];

  data.forEach((t: any) => {
    if (t.done) return;

    const due = new Date(t.due + "T00:00:00");

    if (due < today) {
      notes.push({
        id: t._id,
        text: `${t.text} is overdue`,
        type: "overdue",
      });
    } else if (due.toDateString() === today.toDateString()) {
      notes.push({
        id: t._id,
        text: `${t.text} is due today`,
        type: "today",
      });
    } else {
      notes.push({
        id: t._id,
        text: `${t.text} upcoming`,
        type: "upcoming",
      });
    }
  });

  return notes;
};

useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => {
      setToast("");
    }, 3000);

    return () => clearTimeout(timer);
  }
}, [toast]);

useEffect(() => {
  const handleClick = (e: any) => {
    if (!e.target.closest(".notification-box")) {
      setOpen(false);
    }
  };

  document.addEventListener("click", handleClick);
  return () => document.removeEventListener("click", handleClick);
}, []);

useEffect(() => {
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/tasks");
    const data = await res.json();

    const notes = generateNotifications(data);

    setNotifications(notes);
  };

  fetchTasks();
}, []); 



useEffect(() => {
  localStorage.setItem(
    "readNotifications",
    JSON.stringify(readNotifications)
  );
}, [readNotifications]);

useEffect(() => {
  if (toast) {
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }
}, [toast]);

useEffect(() => {
  setReadNotifications((prev) =>
    prev.filter((id) =>
      notifications.some((n) => n.id === id)
    )
  );
}, [notifications]);

  // 🔥 SAFE USER FETCH
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }
  const role = user?.role || "sales";
  const navItems = getNavItems(role);

  const overdue = notifications.filter((n) => n.type === "overdue");
const today = notifications.filter((n) => n.type === "today");
const upcoming = notifications.filter((n) => n.type === "upcoming");
const unreadCount = importantNotifications.length;

const hasOverdue = importantNotifications.some(
  (n) => n.type === "overdue"
);

const hasToday = importantNotifications.some(
  (n) => n.type === "today"
);

let badgeColor = "bg-green-500";

if (hasOverdue) {
  badgeColor = "bg-red-500";
} else if (hasToday) {
  badgeColor = "bg-yellow-400";
}


  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🔥 INITIALS
  const initials =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

    const NotificationItem = ({ n }) => (
  <div
    key={n.id}
    onClick={() => {
      navigate("/tasks");
      setReadNotifications((prev) =>
        prev.includes(n.id) ? prev : [...prev, n.id]
      );
      setOpen(false);
    }}
   className={`text-xs p-3 rounded-lg cursor-pointer transition-all duration-200 ${
  readNotifications.includes(n.id)
    ? "opacity-40"
    : "bg-muted/30 hover:bg-muted/60 hover:scale-[1.02]"
}`}
  >
    <div className="flex items-center gap-2">
  <span
    className={`w-2 h-2 rounded-full ${
      n.type === "overdue"
        ? "bg-red-400"
        : n.type === "today"
        ? "bg-yellow-400"
        : "bg-green-400"
    }`}
  />
  <span className="truncate">{n.text}</span>
</div>
  </div>
);

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
  onClick={(e) => {
    e.stopPropagation();
    setOpen(!open);
  }}
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


  

  {/* 🔽 Dropdown */}
  {open && (
  <div className="absolute right-0 top-12 mt-2 w-80 bg-card border border-border rounded-xl p-4 shadow-xl z-50">

<div className="flex justify-between items-center mb-4 border-b border-border pb-3">
          <h3 className="text-sm font-semibold">Notifications</h3>

          <div className="flex gap-3">
            <button
  onClick={() =>
    setReadNotifications(notifications.map((n) => n.id))
  }
  className="text-primary hover:underline"
>
  Mark all
</button>

           <button
  onClick={() => {
    setNotifications([]);
    setReadNotifications([]);
  }}
  className="text-red-400 hover:underline"
>
  Clear
</button>
          </div>
        </div>
        
 {notifications.length === 0 && (
  <p className="text-xs text-muted-foreground">
    No notifications
  </p>
)}

{/* OVERDUE */}
{overdue.length > 0 && (
  <>
    <p className="text-xs text-red-400 mb-2">Overdue</p>
   {overdue.map((n) => (
  <NotificationItem key={n.id} n={n} />
))}
  </>
)}

{/* TODAY */}
{today.length > 0 && (
  <>
    <p className="text-xs text-yellow-400 mt-3 mb-2">Today</p>
    {today.map((n) => (
  <NotificationItem key={n.id} n={n} />
))}
  </>
)}

{/* UPCOMING */}
{upcoming.length > 0 && (
  <>
    <p className="text-xs text-green-400 mb-2 mt-2 font-semibold">
  Upcoming
</p>
   {upcoming.map((n) => (
  <NotificationItem key={n.id} n={n} />
))}
  </>
)}

</div>

    
  )}
</div>

          {/* 👤 USER NAME */}
<div
 
  onClick={() => navigate("/profile")}
  className="flex items-center gap-2 cursor-pointer"
>
  <span
  className={`text-sm font-medium hidden sm:block transition-all duration-200 ${
    location.pathname === "/profile"
      ? "text-primary"
      : "text-muted-foreground hover:text-primary"
  }`}
>
    {user?.name || "User"}
  </span>

  {user?.avatar ? (
    <img
      src={`http://localhost:5000/uploads/${user.avatar}`}
      className="w-9 h-9 rounded-xl object-cover"
    />
  ) : (
   <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-black font-bold">
  {initials}
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

   {toast && (
  <div className="fixed bottom-6 right-6 bg-card border border-border px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-right fade-in z-50">

    {/* dot */}
    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>

    {/* text */}
    <p className="text-sm font-medium">{toast}</p>

    {/* close button (optional) */}
    <button
      onClick={() => setToast("")}
      className="text-xs text-muted-foreground hover:text-white ml-2"
    >
      ✕
    </button>

  </div>
)}

    </div>
  );
};

export default DashboardLayout;