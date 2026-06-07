import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan", leads: 45, deals: 12, revenue: 420000 },
  { month: "Feb", leads: 62, deals: 18, revenue: 580000 },
  { month: "Mar", leads: 55, deals: 15, revenue: 510000 },
  { month: "Apr", leads: 78, deals: 22, revenue: 720000 },
  { month: "May", leads: 72, deals: 20, revenue: 680000 },
  { month: "Jun", leads: 95, deals: 28, revenue: 890000 },
];

const pipelineData = [
  { name: "New", value: 35, color: "hsl(210,80%,60%)" },
  { name: "Contacted", value: 25, color: "hsl(40,90%,60%)" },
  { name: "Qualified", value: 20, color: "hsl(168,80%,40%)" },
  { name: "Won", value: 15, color: "hsl(150,70%,50%)" },
  { name: "Lost", value: 5, color: "hsl(0,70%,50%)" },
];

const tooltipStyle = { background: "hsl(200,22%,8%)", border: "1px solid hsl(200,15%,16%)", borderRadius: "12px", color: "hsl(180,20%,90%)" };

const Analytics = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
      <p className="text-sm text-muted-foreground mt-1">Performance insights and trends</p>
    </div>

    <div className="grid lg:grid-cols-2 gap-6">
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Revenue vs Leads</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,16%)" />
            <XAxis dataKey="month" stroke="hsl(200,10%,50%)" fontSize={12} />
            <YAxis yAxisId="left" stroke="hsl(200,10%,50%)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(200,10%,50%)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar yAxisId="left" dataKey="revenue" fill="hsl(168,80%,40%)" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="right" dataKey="leads" fill="hsl(190,90%,50%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Deal Conversion Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(200,15%,16%)" />
            <XAxis dataKey="month" stroke="hsl(200,10%,50%)" fontSize={12} />
            <YAxis stroke="hsl(200,10%,50%)" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="deals" stroke="hsl(168,80%,40%)" strokeWidth={2} dot={{ fill: "hsl(168,80%,40%)" }} />
            <Line type="monotone" dataKey="leads" stroke="hsl(190,90%,50%)" strokeWidth={2} dot={{ fill: "hsl(190,90%,50%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Distribution</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
              {pipelineData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {pipelineData.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Avg Deal Size", value: "₹14.2L" },
            { label: "Win Rate", value: "24.8%" },
            { label: "Avg Sales Cycle", value: "32 days" },
            { label: "Pipeline Value", value: "₹1.46Cr" },
            { label: "Monthly Growth", value: "+12.5%" },
            { label: "Customer LTV", value: "₹42L" },
          ].map((m, i) => (
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

export default Analytics;
