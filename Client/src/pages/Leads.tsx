import { useEffect, useState } from "react";
import { Search, Filter, Grid3X3, List, Plus, Users, UserPlus, UserCheck, Handshake, TrendingUp, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { getAuthHeaders } from "@/utils/api";
import KPICard from "@/components/KPICard";

const Leads = () => {
  const [view, setView] = useState<"table" | "cards">("table");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<any[]>([]);

  // Add Lead form states
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [score, setScore] = useState(50);
  const [temperature, setTemperature] = useState("Warm");

  // Filters
  const [showFilter, setShowFilter] = useState(false);
  const [filterCity, setFilterCity] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [showAddModal, setShowAddModal] = useState(false);

  // FETCH
  const fetchLeads = () => {
    fetch("http://localhost:5000/api/leads", { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeads(data);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // ADD
  const handleAddLead = () => {
    if (!name || !company) return alert("Name & Company required");
    if (phone.length !== 10) return alert("Phone number must be exactly 10 digits");

    fetch("http://localhost:5000/api/leads", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: toTitleCase(name),
        company: toTitleCase(company),
        phone,
        city: toTitleCase(city),
        email,
        source,
        priority,
        score,
        temperature
      }),
    })
      .then(res => res.json())
      .then(() => {
        fetchLeads();
        setName("");
        setCompany("");
        setPhone("");
        setCity("");
        setEmail("");
        setSource("");
        setPriority("Medium");
        setScore(50);
        setTemperature("Warm");
        setShowAddModal(false);
      });
  };

  const toTitleCase = (str: string) =>
    str
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");

  // FILTERING LOGIC
  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.company?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase());

    const matchesCity = l.city?.toLowerCase().includes(filterCity.toLowerCase());
    const matchesCompany = l.company?.toLowerCase().includes(filterCompany.toLowerCase());
    const matchesStatus = filterStatus ? l.status?.toLowerCase() === filterStatus.toLowerCase() : true;
    const matchesSource = filterSource ? l.source?.toLowerCase() === filterSource.toLowerCase() : true;
    const matchesPriority = filterPriority ? l.priority?.toLowerCase() === filterPriority.toLowerCase() : true;

    return matchesSearch && matchesCity && matchesCompany && matchesStatus && matchesSource && matchesPriority;
  });

  // SORTING LOGIC
  const sorted = [...filtered].sort((a, b) => {
    let valA: any = "";
    let valB: any = "";

    if (sortBy === "name") {
      valA = a.name || "";
      valB = b.name || "";
    } else if (sortBy === "company") {
      valA = a.company || "";
      valB = b.company || "";
    } else if (sortBy === "status") {
      valA = a.status || "";
      valB = b.status || "";
    } else if (sortBy === "source") {
      valA = a.source || "";
      valB = b.source || "";
    } else if (sortBy === "priority") {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      valA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
      valB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
    } else if (sortBy === "date") {
      valA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      valB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    }

    if (typeof valA === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // KPI Calculations
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status?.toLowerCase() === "new").length;
  const qualifiedLeadsCount = leads.filter(l => l.status?.toLowerCase() === "qualified").length;
  const convertedLeadsCount = leads.filter(l => l.status?.toLowerCase() === "converted").length;
  const conversionRateVal = totalLeadsCount > 0 ? ((convertedLeadsCount / totalLeadsCount) * 100).toFixed(1) + "%" : "0.0%";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">{leads.length} total leads</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground px-5 py-2 rounded-xl text-sm font-semibold hover-lift hover:opacity-95 transition"
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={Users} title="Total Leads" value={`${totalLeadsCount}`} change="0" changeType="up" />
        <KPICard icon={UserPlus} title="New Leads" value={`${newLeadsCount}`} change="0" changeType="up" />
        <KPICard icon={UserCheck} title="Qualified Leads" value={`${qualifiedLeadsCount}`} change="0" changeType="up" />
        <KPICard icon={Handshake} title="Converted Leads" value={`${convertedLeadsCount}`} change="0" changeType="up" />
        <KPICard icon={TrendingUp} title="Conversion Rate" value={conversionRateVal} change="0" changeType="up" />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* SEARCH */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads..."
              className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          {/* FILTER ICON */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2.5 rounded-xl border border-border/50 hover:bg-secondary transition flex items-center gap-2 text-sm font-medium ${
              showFilter ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary/40 text-foreground"
            }`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* SORT DROPDOWN */}
          <div className="flex items-center gap-2 bg-secondary/40 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground">
            <ArrowUpDown size={14} className="text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none focus:outline-none cursor-pointer text-sm text-foreground"
            >
              <option value="date" className="bg-slate-950 text-white">Sort by Date</option>
              <option value="name" className="bg-slate-950 text-white">Sort by Name</option>
              <option value="company" className="bg-slate-950 text-white">Sort by Company</option>
              <option value="status" className="bg-slate-950 text-white">Sort by Status</option>
              <option value="source" className="bg-slate-950 text-white">Sort by Source</option>
              <option value="priority" className="bg-slate-950 text-white">Sort by Priority</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="text-xs text-primary hover:text-cyan transition ml-2 font-medium"
            >
              {sortOrder === "asc" ? "ASC" : "DESC"}
            </button>
          </div>

          {/* VIEW TOGGLE */}
          <div className="flex rounded-xl overflow-hidden border border-border/50 bg-secondary/40">
            <button
              onClick={() => setView("table")}
              className={`p-2.5 ${view === "table" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary/40"}`}
            >
              <List size={16} />
            </button>

            <button
              onClick={() => setView("cards")}
              className={`p-2.5 ${view === "cards" ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary/40"}`}
            >
              <Grid3X3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilter && (
        <div className="glass p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 border border-white/5">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Source</label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Sources</option>
              <option value="Website">Website</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">City</label>
            <input
              placeholder="Filter by City"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Company</label>
            <input
              placeholder="Filter by Company"
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="glass rounded-2xl overflow-x-auto border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-secondary/20">
                <th onClick={() => handleSort("name")} className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th onClick={() => handleSort("company")} className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    Company {sortBy === "company" && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
                <th onClick={() => handleSort("status")} className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    Lead Status {sortBy === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th onClick={() => handleSort("source")} className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    Lead Source {sortBy === "source" && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th onClick={() => handleSort("priority")} className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    Priority {sortBy === "priority" && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th onClick={() => handleSort("date")} className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:text-primary transition-colors">
                  <div className="flex items-center gap-1">
                    Created Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                    No leads found matching criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((l) => (
                  <tr key={l._id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/leads/${l._id}`}
                        className="text-base font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        {l.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{l.company}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{l.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        l.status?.toLowerCase() === "new" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                        l.status?.toLowerCase() === "contacted" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        l.status?.toLowerCase() === "qualified" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                        l.status?.toLowerCase() === "converted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}>
                        {l.status || "new"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{l.source || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                        l.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                        l.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}>
                        {l.priority || "Medium"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/leads/${l._id}`}
                        className="text-sm font-semibold text-primary hover:text-cyan transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CARD VIEW */}
      {view === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.length === 0 ? (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              No leads found matching criteria.
            </div>
          ) : (
            sorted.map((l) => (
              <div key={l._id} className="p-5 rounded-2xl bg-secondary/30 border border-border/50 glass hover-lift flex flex-col justify-between h-56">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-lg">
                        <Link
                          to={`/leads/${l._id}`}
                          className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors"
                        >
                          {l.name}
                        </Link>
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">{l.company}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      l.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                      l.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}>
                      {l.priority || "Medium"}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-1 text-sm text-slate-300">
                    <p className="flex items-center gap-2"><span className="text-muted-foreground">Phone:</span> {l.phone}</p>
                    <p className="flex items-center gap-2"><span className="text-muted-foreground">Source:</span> {l.source || "-"}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                    l.status?.toLowerCase() === "new" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    l.status?.toLowerCase() === "contacted" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    l.status?.toLowerCase() === "qualified" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    l.status?.toLowerCase() === "converted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {l.status || "new"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "-"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl p-6 border border-slate-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-white">Add Lead</h2>

            {/* Name */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Company */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Company *</label>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Phone *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Phone (10 digits)"
                inputMode="numeric"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* City */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                type="email"
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Source */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select Source</option>
                <option value="Website">Website</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="Referral">Referral</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Priority */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-primary"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Score */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-primary"
              />
            </div>

            {/* Temperature */}
            <div className="mb-6">
              <label className="text-xs text-slate-400 block mb-1">Temperature</label>
              <select
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-primary"
              >
                <option value="Cold">Cold</option>
                <option value="Warm">Warm</option>
                <option value="Hot">Hot</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleAddLead();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold hover:opacity-90 transition"
              >
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;