import { Users, IndianRupee, TrendingUp, Handshake, Clock, Sparkles } from "lucide-react";
import KPICard from "@/components/KPICard";
import { useEffect, useState } from "react";
import { getAuthHeaders, API_BASE_URL } from "@/utils/api";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role;

  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ["websocket"], withCredentials: true });

    const fetchAllData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard/stats`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE_URL}/api/dashboard/tasks-preview`, { headers: getAuthHeaders() })
        ]);
        const statsData = await statsRes.json();
        const tasksData = await tasksRes.json();
        setStats(statsData);
        setTasks(tasksData);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };

    fetchAllData();

    socket.on("dashboardUpdated", () => {
      fetchAllData();
    });

    socket.on("tasksUpdated", () => {
      fetchAllData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!stats) return <p className="text-white p-6">Loading...</p>;

  // 🔥 Month mapping (smooth charts)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const revenueData = months.map((month, i) => {
    const found = stats?.monthlyRevenue?.find((m: any) => m._id === i + 1);
    return { name: month, revenue: found ? found.total : 0 };
  });

  const leadsData = months.map((month, i) => {
    const found = stats?.monthlyLeads?.find((m: any) => m._id === i + 1);
    return { name: month, leads: found ? found.total : 0 };
  });

  // Task summary counts (computed from existing tasks)
  const pendingTasksCount = (tasks || []).filter(t => !t.done).length;
  const completedTasksCount = (tasks || []).filter(t => t.done).length;

  return (
    <div className="space-y-6 w-full max-w-full px-6 lg:px-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {role === "admin" && "Admin Dashboard 👑"}
          {role === "manager" && "Manager Dashboard 📊"}
          {role === "sales" && "Sales Dashboard "}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, here's your overview</p>
      </div>

      {/* KPI Cards - desktop: single row with 6 equal cards */}
      <div className="w-full max-w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="h-40 lg:h-48 flex items-stretch w-full">
            <div className="w-full h-full p-2">
              <KPICard icon={Users} title="Total Leads" value={`${stats.totalLeads}`} change={stats.leadsChange} changeType={stats.leadsChangeType} />
            </div>
          </div>

          <div className="h-40 lg:h-48 flex items-stretch w-full">
            <div className="w-full h-full p-2">
              <KPICard icon={IndianRupee} title="Revenue" value={`₹${(stats.revenue / 100000).toFixed(1)}L`} change={stats.revenueChange} changeType={stats.revenueChangeType} />
            </div>
          </div>

          <div className="h-40 lg:h-48 flex items-stretch w-full">
            <div className="w-full h-full p-2">
              <KPICard icon={TrendingUp} title="Conversion Rate" value={`${stats.conversionRate}%`} change={stats.conversionRateChange} changeType={stats.conversionRateChangeType} />
            </div>
          </div>

          <div className="h-40 lg:h-48 flex items-stretch w-full">
            <div className="w-full h-full p-2">
              <KPICard icon={Handshake} title="Active Deals" value={`${stats.activeDeals}`} change={stats.activeDealsChange} changeType={stats.activeDealsChangeType} />
            </div>
          </div>

          <div className="h-40 lg:h-48 flex items-stretch w-full">
            <div className="w-full h-full p-2">
              <KPICard icon={Sparkles} title="Won Deals" value={`${stats.wonDeals}`} change={stats.wonDealsChange} changeType={stats.wonDealsChangeType} />
            </div>
          </div>

          <div className="h-40 lg:h-48 flex items-stretch w-full">
            <div className="w-full h-full p-2">
              <KPICard icon={Clock} title="Total Contacts" value={`${stats.totalContacts}`} change={stats.contactsChange} changeType={stats.contactsChangeType} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts - side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-2xl p-5 bg-[#020617] border border-white/5 h-full flex flex-col">
          <h3 className="text-sm text-gray-400 mb-3">Revenue Trend</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }} />
                <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} animationDuration={1000} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#020617] border border-white/5 h-full flex flex-col">
          <h3 className="text-sm text-gray-400 mb-3">Leads Overview</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsData}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "#020617", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px" }} />
                <Bar dataKey="leads" fill="#14b8a6" radius={[10, 10, 0, 0]} barSize={35} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tasks and Recent Activity side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="glass p-4 rounded-2xl space-y-3 h-full flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-foreground">Tasks</h3>
            <a href="/tasks" className="text-primary text-xs">View All →</a>
          </div>

          <div className="flex gap-3 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Pending Tasks:</span>
              <span className="font-medium text-foreground">{pendingTasksCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Completed Tasks:</span>
              <span className="font-medium text-foreground">{completedTasksCount}</span>
            </div>
          </div>

          <div className="space-y-2 overflow-auto max-h-[300px] pr-2">
            {tasks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No tasks yet 🚀</p>
                <a href="/tasks" className="text-xs text-primary underline">Create your first task</a>
              </div>
            ) : (
              tasks.map((t) => (
                <div key={t._id} className="flex items-center gap-2">
                  <input aria-label={`task-${t._id}`} type="checkbox" checked={t.done} readOnly className="accent-primary" />
                  <span className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.text}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-4 rounded-2xl space-y-3 h-full flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <a href="/deals" className="text-primary text-xs">View All →</a>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
            {!stats.activities || stats.activities.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">No recent activity</p>
              </div>
            ) : (
              stats.activities.map((a: any, idx: number) => (
                <div key={`${a._id || idx}-${idx}`} className="py-2 border-b border-white/5 last:border-b-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.action}{a.meta ? ` — ${a.meta}` : ''}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{new Date(a.timestamp || a.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
