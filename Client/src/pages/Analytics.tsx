import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAuthHeaders } from "@/utils/api";
import { io } from "socket.io-client";

const COLORS = [
  "hsl(210,80%,60%)",
  "hsl(40,90%,60%)",
  "hsl(168,80%,40%)",
  "hsl(150,70%,50%)",
  "hsl(0,70%,50%)",
  "hsl(280,70%,60%)",
  "hsl(330,80%,60%)"
];

const tooltipStyle = { background: "hsl(200,22%,8%)", border: "1px solid hsl(200,15%,16%)", borderRadius: "12px", color: "hsl(180,20%,90%)" };

const Analytics = () => {
  const [stats, setStats] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, dealsRes] = await Promise.all([
        fetch("http://localhost:5000/api/dashboard/stats", { headers: getAuthHeaders() }),
        fetch("http://localhost:5000/api/deals", { headers: getAuthHeaders() })
      ]);
      const statsData = await statsRes.json();
      const dealsData = await dealsRes.json();
      setStats(statsData);
      setDeals(Array.isArray(dealsData) ? dealsData : (dealsData?.data || []));
    } catch (err) {
      console.error("Error fetching analytics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = io("http://localhost:5000", { transports: ["websocket"], withCredentials: true });
    socket.on("dashboardUpdated", () => {
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading Analytics Dashboard...</p>
      </div>
    );
  }

  // --- Map Chart Data ---
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const revenueVsLeadsData = months.map((month, i) => {
    const revFound = stats.monthlyRevenue?.find((m: any) => m._id === i + 1);
    const leadsFound = stats.monthlyLeads?.find((m: any) => m._id === i + 1);
    return {
      month,
      revenue: revFound ? revFound.total : 0,
      leads: leadsFound ? leadsFound.total : 0
    };
  });

  const pipelineData = stats.dealStatusDistribution?.map((d: any, idx: number) => ({
    name: d._id.charAt(0).toUpperCase() + d._id.slice(1),
    value: d.value,
    color: COLORS[idx % COLORS.length]
  })) || [];

  // --- Dynamic Key Metrics ---
  const wonDealsCount = deals.filter(d => d.stage === "won").length;
  const totalDealsCount = deals.length;
  const activeDealsList = deals.filter(d => d.stage !== "won" && d.stage !== "lost");
  const pipelineValue = activeDealsList.reduce((sum, d) => sum + (parseFloat(String(d.value).replace(/[^0-9.]/g, "")) || 0), 0);
  
  const avgDealSize = wonDealsCount ? (stats.revenue / wonDealsCount) : 0;
  const winRate = totalDealsCount ? ((wonDealsCount / totalDealsCount) * 100).toFixed(1) + "%" : "0.0%";
  
  const formatINR = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const metrics = [
    { label: "Avg Deal Size", value: formatINR(avgDealSize) },
    { label: "Win Rate", value: winRate },
    { label: "Pipeline Value", value: formatINR(pipelineValue) },
    { label: "Total Leads", value: String(stats.totalLeads) },
    { label: "Monthly Revenue Growth", value: `${stats.revenueChangeType === "up" ? "+" : "-"}${stats.revenueChange}` },
    { label: "Total Contacts", value: String(stats.totalContacts) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Performance insights and trends</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue vs Leads</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueVsLeadsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,16%)" />
              <XAxis dataKey="month" stroke="hsl(200,10%,50%)" fontSize={12} />
              <YAxis yAxisId="left" stroke="hsl(200,10%,50%)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(200,10%,50%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar yAxisId="left" dataKey="revenue" fill="hsl(168,80%,40%)" name="Revenue" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="leads" fill="hsl(190,90%,50%)" name="Leads" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Deal Conversion Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueVsLeadsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,16%)" />
              <XAxis dataKey="month" stroke="hsl(200,10%,50%)" fontSize={12} />
              <YAxis stroke="hsl(200,10%,50%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(168,80%,40%)" strokeWidth={2} name="Revenue Trend" dot={{ fill: "hsl(168,80%,40%)" }} />
              <Line type="monotone" dataKey="leads" stroke="hsl(190,90%,50%)" strokeWidth={2} name="Lead Growth" dot={{ fill: "hsl(190,90%,50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Distribution</h3>
          {pipelineData.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No deal stages data to display
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                    {pipelineData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {pipelineData.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Key Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold text-foreground mt-1">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
