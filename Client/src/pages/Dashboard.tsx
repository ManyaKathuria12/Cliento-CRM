import { Users, IndianRupee, TrendingUp, Handshake, Clock, Sparkles } from "lucide-react";
import KPICard from "@/components/KPICard";
import { useEffect, useState } from "react";

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
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [stats, setStats] = useState(null);

   const [tasks, setTasks] = useState([]);



 useEffect(() => {
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5000/api/dashboard/tasks-preview");
    const data = await res.json();
    setTasks(data);
  };

  fetchTasks();
}, []);

  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dashboard/stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.log("Error fetching stats", err);
      }
    };
    fetchStats();
  }, []);

  if (!stats) return <p className="text-white">Loading...</p>;

  // 🔥 Month mapping (smooth charts)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const revenueData = months.map((month, i) => {
    const found = stats?.monthlyRevenue?.find(m => m._id === i + 1);
    return {
      name: month,
      revenue: found ? found.total : 0
    };
  });

  const leadsData = months.map((month, i) => {
    const found = stats?.monthlyLeads?.find(m => m._id === i + 1);
    return {
      name: month,
      leads: found ? found.total : 0
    };
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {role === "admin" && "Admin Dashboard 👑"}
          {role === "manager" && "Manager Dashboard 📊"}
          {role === "sales" && "Sales Dashboard 💼"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, here's your overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} title="Total Leads" value={stats.totalLeads} />
        <KPICard icon={IndianRupee} title="Revenue" value={`₹${(stats.revenue / 100000).toFixed(1)}L`} />
        <KPICard icon={TrendingUp} title="Conversion Rate" value={`${stats.conversionRate}%`} />
        <KPICard icon={Handshake} title="Active Deals" value={stats.activeDeals} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Revenue Chart */}
        <div className="rounded-2xl p-5 bg-[#020617] border border-white/5">
          <h3 className="text-sm text-gray-400 mb-3">Revenue Trend</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                }}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leads Chart */}
        <div className="rounded-2xl p-5 bg-[#020617] border border-white/5">
          <h3 className="text-sm text-gray-400 mb-3">Leads Overview</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadsData}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "10px",
                }}
              />

              <Bar
                dataKey="leads"
                fill="#14b8a6"
                radius={[10, 10, 0, 0]}
                barSize={35}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-6 rounded-2xl space-y-4">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-sm font-semibold">Tasks</h3>

    <a href="/tasks" className="text-primary text-xs">
      View All →
    </a>
  </div>

  <div className="space-y-3">

  {tasks.length === 0 ? (
    <div className="text-center py-6">
      <p className="text-sm text-muted-foreground mb-2">
        No tasks yet 🚀
      </p>

      <a
        href="/tasks"
        className="text-xs text-primary underline"
      >
        Create your first task
      </a>
    </div>
  ) : (
    tasks.map((t) => (
      <div key={t._id} className="flex items-center gap-3">

        <input
          type="checkbox"
          checked={t.done}
          readOnly
          className="accent-primary"
        />

        <span
          className={`text-sm ${
            t.done ? "line-through text-muted-foreground" : ""
          }`}
        >
          {t.text}
        </span>

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