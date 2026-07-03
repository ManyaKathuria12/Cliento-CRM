import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Users, UserCheck, ClipboardList, CheckCircle, TrendingUp } from "lucide-react";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLeads: 0,
    activeDeals: 0,
    revenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, leadsRes, dealsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users", { headers: getAuthHeaders() }),
          axios.get("http://localhost:5000/api/leads", { headers: getAuthHeaders() }),
          axios.get("http://localhost:5000/api/deals", { headers: getAuthHeaders() }),
        ]);

        const deals = dealsRes.data || [];
        const revenue = deals
          .filter((deal: any) => deal.stage === "won")
          .reduce((sum: number, deal: any) => sum + (Number(deal.value) || 0), 0);

        setStats({
          totalUsers: usersRes.data?.length || 0,
          totalLeads: leadsRes.data?.length || 0,
          activeDeals: deals.filter((deal: any) => deal.stage !== "won" && deal.stage !== "lost").length,
          revenue,
        });
        setRecentUsers((usersRes.data || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };

    loadData();

    const socket = io("http://localhost:5000", { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("AdminDashboard socket connected", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("AdminDashboard socket connect error", err);
    });
    socket.on("dashboardUpdated", () => {
      console.log("AdminDashboard received dashboardUpdated");
      loadData();
    });
    socket.on("tasksUpdated", () => {
      console.log("AdminDashboard received tasksUpdated");
      loadData();
    });
    socket.on("usersUpdated", () => {
      console.log("AdminDashboard received usersUpdated");
      loadData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const cards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users },
    { title: "Total Leads", value: stats.totalLeads, icon: UserCheck },
    { title: "Active Deals", value: stats.activeDeals, icon: ClipboardList },
    { title: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-2">Monitor CRM activity and account health from a single place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="glass rounded-2xl border border-border/50 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.title}</p>
                  <h2 className="text-2xl font-semibold mt-2">{item.value}</h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon size={22} className="text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mt-8">
        <div className="glass rounded-2xl border border-border/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Accounts</h2>
            <span className="text-sm text-muted-foreground">Live from user directory</span>
          </div>
          <div className="space-y-4">
            {recentUsers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No users available yet.</div>
            ) : recentUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between border-b border-border/40 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-black">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{user.role || "sales"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl border border-border/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="text-lg font-semibold">Admin Snapshot</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl bg-background/60 px-3 py-2">
              <span>Users</span>
              <span className="font-medium text-foreground">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/60 px-3 py-2">
              <span>Leads</span>
              <span className="font-medium text-foreground">{stats.totalLeads}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/60 px-3 py-2">
              <span>Open deals</span>
              <span className="font-medium text-foreground">{stats.activeDeals}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-background/60 px-3 py-2">
              <span>Won revenue</span>
              <span className="font-medium text-foreground">₹{stats.revenue.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}