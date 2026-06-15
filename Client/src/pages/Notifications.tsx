import { useState } from "react";
import { 
  Users, Handshake, CheckSquare, Contact, Zap, 
  Trash2, Check, CheckCheck, Bell, BellOff, AlertTriangle, Clock 
} from "lucide-react";
import KPICard from "@/components/KPICard";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: "lead" | "deal" | "task" | "contact" | "system";
  read: boolean;
  priority: "low" | "medium" | "high";
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "New Lead Created",
    description: 'A new hot lead "Rajesh Kumar" was generated from the Website contact form.',
    timestamp: "10 mins ago",
    category: "lead",
    read: false,
    priority: "medium",
  },
  {
    id: "n2",
    title: "Deal Moved to Won 🎉",
    description: 'The deal "Enterprise Software License" with Acme Corp has been closed won (₹15,00,000).',
    timestamp: "2 hours ago",
    category: "deal",
    read: false,
    priority: "high",
  },
  {
    id: "n3",
    title: "Task Due Today ⏰",
    description: "Follow up call with Priya Sharma is scheduled for today by 5:00 PM.",
    timestamp: "4 hours ago",
    category: "task",
    read: false,
    priority: "high",
  },
  {
    id: "n4",
    title: "Contact Updated",
    description: "Amit Patel's primary phone number and email address were updated.",
    timestamp: "Yesterday",
    category: "contact",
    read: true,
    priority: "low",
  },
  {
    id: "n5",
    title: "Revenue Milestone Reached",
    description: "Congratulations! Monthly recurring revenue has surpassed the target milestone of ₹20,00,000.",
    timestamp: "Yesterday",
    category: "system",
    read: true,
    priority: "high",
  },
  {
    id: "n6",
    title: "Hot Lead Scoring Alert",
    description: 'Lead "Vikram Singh" has reached a hot scoring threshold of 85 points.',
    timestamp: "2 days ago",
    category: "lead",
    read: true,
    priority: "medium",
  },
  {
    id: "n7",
    title: "Deal Value Updated",
    description: 'Deal "Cloud Migration" estimated value has been updated to ₹8,00,000.',
    timestamp: "3 days ago",
    category: "deal",
    read: true,
    priority: "medium",
  },
  {
    id: "n8",
    title: "New Task Assigned",
    description: "You have been assigned a new task: Review contract drafts for Malhotra Group.",
    timestamp: "4 days ago",
    category: "task",
    read: true,
    priority: "low",
  },
];

const categoryConfig = {
  lead: {
    icon: Users,
    colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    label: "Lead",
  },
  deal: {
    icon: Handshake,
    colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    label: "Deal",
  },
  task: {
    icon: CheckSquare,
    colorClass: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    label: "Task",
  },
  contact: {
    icon: Contact,
    colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    label: "Contact",
  },
  system: {
    icon: Zap,
    colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    label: "System",
  },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<string>("all");

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;
  const highPriorityCount = notifications.filter((n) => n.priority === "high").length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDeleteAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.category === filter;
  });

  const categories = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "lead", label: "Leads" },
    { id: "deal", label: "Deals" },
    { id: "task", label: "Tasks" },
    { id: "contact", label: "Contacts" },
    { id: "system", label: "System" },
  ];

  return (
    <div className="space-y-6 w-full max-w-full px-6 lg:px-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with CRM activities and important events.
          </p>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-secondary/60 hover:bg-secondary border border-border/80 text-foreground transition-all cursor-pointer"
            >
              <CheckCheck size={14} className="text-primary" /> Mark All as Read
            </button>
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive transition-all cursor-pointer"
            >
              <Trash2 size={14} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Notifications"
          value={String(totalCount)}
          change="0%"
          changeType="up"
          icon={Bell}
        />
        <KPICard
          title="Unread"
          value={String(unreadCount)}
          change="0%"
          changeType="up"
          icon={AlertTriangle}
        />
        <KPICard
          title="Read"
          value={String(readCount)}
          change="0%"
          changeType="up"
          icon={CheckCheck}
        />
        <KPICard
          title="High Priority"
          value={String(highPriorityCount)}
          change="0%"
          changeType="up"
          icon={Zap}
        />
      </div>

      {/* FILTERS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const count =
            cat.id === "all"
              ? totalCount
              : cat.id === "unread"
              ? unreadCount
              : notifications.filter((n) => n.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                filter === cat.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-border/50"
              }`}
            >
              <span>{cat.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    filter === cat.id
                      ? "bg-primary-foreground text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* LIST OF NOTIFICATIONS */}
      <div className="glass rounded-2xl p-6 border border-border/50">
        <AnimatePresence mode="wait">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-16 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
                <BellOff size={28} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">All caught up! 🎉</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  No notifications match your current filter selection.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-border/40 space-y-4"
            >
              {filteredNotifications.map((n) => {
                const config = categoryConfig[n.category] || categoryConfig.system;
                const CategoryIcon = config.icon;

                return (
                  <motion.div
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start justify-between gap-4 p-4 rounded-xl border bg-secondary/20 border-border/50 hover:bg-secondary/35 transition-all duration-300 ${
                      n.id !== filteredNotifications[0].id ? "mt-4" : ""
                    }`}
                  >
                    {/* LEFT SIDE: ICON & INFO */}
                    <div className="flex gap-4 flex-1">
                      {/* CATEGORY ICON */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.colorClass}`}
                      >
                        <CategoryIcon size={18} />
                      </div>

                      {/* TEXT INFO */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-semibold text-foreground ${!n.read ? "font-bold" : ""}`}>
                            {n.title}
                          </h4>
                          {/* UNREAD PIN */}
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {n.description}
                        </p>
                        
                        {/* BADGES & TIMESTAMP */}
                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          {/* Category Badge */}
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider ${config.colorClass}`}
                          >
                            {config.label}
                          </span>

                          {/* Priority Badge */}
                          {n.priority !== "low" && (
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border uppercase tracking-wider ${
                                n.priority === "high"
                                  ? "text-red-400 bg-red-500/10 border-red-500/20"
                                  : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                              }`}
                            >
                              {n.priority} Priority
                            </span>
                          )}

                          {/* Time */}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} />
                            <span>{n.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT SIDE: CARD ACTIONS */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleRead(n.id)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          !n.read
                            ? "text-primary hover:bg-primary/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                        title={n.read ? "Mark as unread" : "Mark as read"}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notifications;
