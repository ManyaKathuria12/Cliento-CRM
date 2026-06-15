import { useState, useEffect } from "react";
import { 
  IndianRupee, Calendar, User, Search, Filter, ArrowUpDown, 
  Trash2, Edit3, Eye, Plus, Building, Phone, ArrowUpRight, check
} from "lucide-react";
import { getAuthHeaders } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface Deal {
  id: string;
  title: string;
  company: string;
  value: string;
  contact: string;
  stage: string;
  notes?: string;
  createdAt: string;
  activity?: Array<{ action: string; timestamp: string }>;
}

const STAGES = {
  new: { label: "New Lead", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  contacted: { label: "Contacted", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  qualified: { label: "Qualified", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  proposal: { label: "Proposal Sent", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  negotiation: { label: "Negotiation", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  won: { label: "Won", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  lost: { label: "Lost", color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

const mapStageToKey = (stage?: string): string => {
  if (!stage) return "new";
  const s = stage.toLowerCase();
  if (s === "new" || s === "new lead") return "new";
  if (s === "contacted") return "contacted";
  if (s === "qualified") return "qualified";
  if (s === "proposal" || s === "proposal sent") return "proposal";
  if (s === "negotiation") return "negotiation";
  if (s === "won") return "won";
  if (s === "lost") return "lost";
  return "new"; // default fallback
};

export default function Deals() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  
  // Filtering & Sorting
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortField, setSortField] = useState<"value" | "date" | "stage">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<string | null>(null);
  const [newDeal, setNewDeal] = useState({
    title: "",
    company: "",
    value: "",
    contact: "",
    stage: "new",
    leadId: "",
    notes: "",
  });
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
    fetchLeads();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/deals", { headers: getAuthHeaders() });
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.deals || [];
      
      const mappedDeals = items.map((d: any) => ({
        id: d._id,
        title: d.title || "Untitled Deal",
        company: d.company || "No Company",
        value: d.value || "0",
        contact: d.contact || "N/A",
        stage: mapStageToKey(d.stage),
        notes: d.notes || "",
        createdAt: d.createdAt || new Date().toISOString(),
        activity: d.activity || [],
      }));
      setDeals(mappedDeals);
      
      // Auto-select deal if dealId query param exists
      const params = new URLSearchParams(window.location.search);
      const urlDealId = params.get("dealId");
      if (urlDealId) {
        const found = mappedDeals.find((d: any) => d.id === urlDealId);
        if (found) {
          setSelectedDeal(found);
          setIsEditing(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deals ❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/leads", { headers: getAuthHeaders() });
      const data = await res.json();
      setLeads(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addDeal = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/deals", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDeal),
      });

      if (!res.ok) throw new Error("Failed to create deal");
      toast.success("Deal added successfully!");
      fetchDeals();
      setNewDeal({ title: "", company: "", value: "", contact: "", stage: "new", leadId: "", notes: "" });
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create deal ❌");
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDealToDelete(id);
    setShowDeleteConfirm(true);
  };

  const deleteDeal = async () => {
    if (!dealToDelete) return;
    try {
      const res = await fetch(`http://localhost:5000/api/deals/${dealToDelete}`, { 
        method: "DELETE", 
        headers: getAuthHeaders() 
      });

      if (!res.ok) throw new Error("Failed to delete deal");
      toast.success("Deal deleted ✅");
      fetchDeals();
      setSelectedDeal(null);
      setShowDeleteConfirm(false);
      setDealToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Delete failed ❌");
    }
  };

  const updateDeal = async () => {
    if (!selectedDeal) return;
    try {
      const res = await fetch(`http://localhost:5000/api/deals/${selectedDeal.id}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedDeal),
      });

      if (!res.ok) throw new Error("Failed to update deal");
      toast.success("Deal updated successfully!");
      fetchDeals();
      setIsEditing(false);
      setSelectedDeal(null);
    } catch (err: any) {
      toast.error(err.message || "Update failed ❌");
    }
  };

  const formatValue = (v?: string) => {
    const n = Number(v || 0);
    return n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  };

  const handleSort = (field: "value" | "date" | "stage") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Stats calculations
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.stage !== "won" && d.stage !== "lost").length;
  const wonDeals = deals.filter(d => d.stage === "won").length;
  const lostDeals = deals.filter(d => d.stage === "lost").length;
  const totalRevenue = deals
    .filter(d => d.stage === "won")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);

  // Filter & Search
  const filteredDeals = deals
    .filter(d => {
      const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) || 
                            d.company.toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === "all" || d.stage === stageFilter;
      return matchesSearch && matchesStage;
    })
    .sort((a, b) => {
      let multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortField === "value") {
        return (Number(a.value || 0) - Number(b.value || 0)) * multiplier;
      }
      if (sortField === "date") {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
      }
      if (sortField === "stage") {
        return a.stage.localeCompare(b.stage) * multiplier;
      }
      return 0;
    });

  return (
    <div className="space-y-6 w-full max-w-full px-6 lg:px-8 pb-12">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deals Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Review active pipelines, statistics, and detailed stages.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm cursor-pointer hover:opacity-90 transition-all"
        >
          <Plus size={16} /> Add Deal
        </button>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Deals */}
        <div className="glass p-5 rounded-2xl border border-border/50 space-y-1 relative overflow-hidden group hover:border-primary/30 transition-all">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Deals</p>
          <p className="text-2xl font-extrabold text-foreground">{totalDeals}</p>
        </div>
        {/* Active Deals */}
        <div className="glass p-5 rounded-2xl border border-border/50 space-y-1 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Deals</p>
          <p className="text-2xl font-extrabold text-blue-400">{activeDeals}</p>
        </div>
        {/* Won Deals */}
        <div className="glass p-5 rounded-2xl border border-border/50 space-y-1 relative overflow-hidden group hover:border-green-500/30 transition-all">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Won Deals</p>
          <p className="text-2xl font-extrabold text-emerald-400">{wonDeals}</p>
        </div>
        {/* Lost Deals */}
        <div className="glass p-5 rounded-2xl border border-border/50 space-y-1 relative overflow-hidden group hover:border-red-500/30 transition-all">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lost Deals</p>
          <p className="text-2xl font-extrabold text-rose-400">{lostDeals}</p>
        </div>
        {/* Total Revenue */}
        <div className="glass p-5 rounded-2xl border border-border/50 space-y-1 relative overflow-hidden group hover:border-emerald-500/30 transition-all sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-400 truncate">{formatValue(totalRevenue.toString())}</p>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-secondary/20 p-4 rounded-2xl border border-border/40">
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals or company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/80 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-all text-sm"
          />
        </div>

        {/* STAGE TABS */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {["all", "new", "contacted", "qualified", "won", "lost"].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                stageFilter === stage 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              {stage === "all" ? "All" : STAGES[stage as keyof typeof STAGES]?.label || stage}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading deal statistics...</p>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-border/50 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/60 bg-secondary/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4">Deal Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("value")}>
                  <div className="flex items-center gap-1">Value <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("stage")}>
                  <div className="flex items-center gap-1">Stage <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("date")}>
                  <div className="flex items-center gap-1">Created Date <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-muted-foreground">
                    No deals match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => {
                  const stageInfo = STAGES[deal.stage as keyof typeof STAGES] || { label: deal.stage, color: "text-gray-400 bg-gray-500/10 border-gray-500/20" };
                  return (
                    <tr 
                      key={deal.id}
                      onClick={() => { setSelectedDeal(deal); setIsEditing(false); }}
                      className="hover:bg-secondary/20 border-b border-border/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-bold text-foreground group-hover:text-primary transition-colors">{deal.title}</td>
                      <td className="px-6 py-4 text-muted-foreground">{deal.company}</td>
                      <td className="px-6 py-4 text-muted-foreground">{deal.contact}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{formatValue(deal.value)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${stageInfo.color}`}>
                          {stageInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(deal.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-muted-foreground">{user?.name || "Unassigned"}</td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => { setSelectedDeal(deal); setIsEditing(false); }}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => { setSelectedDeal(deal); setIsEditing(true); }}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={(e) => confirmDelete(deal.id, e)}
                            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD DEAL MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="glass-strong border border-border/80 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-center text-foreground">Add Deal</h2>

            <select
              aria-label="Select Lead"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm focus:outline-none focus:border-primary"
              onChange={(e) => setNewDeal({ ...newDeal, leadId: e.target.value })}
            >
              <option value="">Select Lead</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.name} - {l.company}
                </option>
              ))}
            </select>

            <input
              value={newDeal.title}
              placeholder="Title"
              aria-label="Deal Title"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/60 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary"
              onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
            />

            <input
              value={newDeal.value}
              placeholder="Value (INR)"
              aria-label="Deal Value"
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/60 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary"
              onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
            />

            <textarea
              placeholder="Add notes..."
              value={newDeal.notes}
              onChange={(e) => setNewDeal({ ...newDeal, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/60 text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:border-primary"
            />

            <select
              aria-label="Stage"
              value={newDeal.stage}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm focus:outline-none focus:border-primary"
              onChange={(e) => setNewDeal({ ...newDeal, stage: e.target.value })}
            >
              <option value="new">New Lead</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="w-1/2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition cursor-pointer">Cancel</button>
              <button onClick={addDeal} className="w-1/2 bg-gradient-to-r from-primary to-cyan text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition cursor-pointer">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL / EDIT MODAL */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="glass-strong border border-border/80 p-6 rounded-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground truncate">{isEditing ? "Edit Deal" : selectedDeal.title}</h2>
              {!isEditing && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${STAGES[selectedDeal.stage as keyof typeof STAGES]?.color || "text-gray-400 border-gray-500/20 bg-gray-500/10"}`}>
                  {STAGES[selectedDeal.stage as keyof typeof STAGES]?.label || selectedDeal.stage}
                </span>
              )}
            </div>

            {!isEditing ? (
              <>
                <div className="space-y-3 pt-2">
                  <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5 flex items-center gap-3">
                    <Building size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Company</p>
                      <p className="font-semibold text-foreground">{selectedDeal.company}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5 flex items-center gap-3">
                    <Phone size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Phone</p>
                      <p className="font-semibold text-foreground">{selectedDeal.contact}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5 flex items-center gap-3">
                    <IndianRupee size={16} className="text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Amount</p>
                      <p className="text-xl font-bold text-foreground">{formatValue(selectedDeal.value)}</p>
                    </div>
                  </div>

                  {selectedDeal.notes && (
                    <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Notes</p>
                      <p className="text-foreground text-sm">{selectedDeal.notes}</p>
                    </div>
                  )}

                  {selectedDeal.activity && selectedDeal.activity.length > 0 && (
                    <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5 max-h-[160px] overflow-y-auto">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2.5">Timeline</p>
                      <div className="space-y-3">
                        {[...selectedDeal.activity].reverse().map((act, idx) => (
                          <div key={idx} className="flex gap-2.5 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <div>
                              <p className="text-foreground font-semibold leading-tight">{act.action}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(act.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(true)} className="w-1/2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition cursor-pointer">Edit</button>
                  <button onClick={(e) => confirmDelete(selectedDeal.id, e)} className="w-1/2 bg-destructive/10 border border-destructive/20 text-destructive py-2.5 rounded-xl text-sm font-semibold hover:bg-destructive/20 transition cursor-pointer">Delete</button>
                </div>

                <button onClick={() => setSelectedDeal(null)} className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition cursor-pointer">Close</button>
              </>
            ) : (
              <>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold">Title</label>
                    <input aria-label="Deal Title" placeholder="Title" value={selectedDeal.title} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm" onChange={(e) => setSelectedDeal({ ...selectedDeal, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold">Company</label>
                    <input aria-label="Company" placeholder="Company" value={selectedDeal.company} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm" onChange={(e) => setSelectedDeal({ ...selectedDeal, company: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold">Value</label>
                    <input aria-label="Deal Value" placeholder="Value" value={selectedDeal.value} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm" onChange={(e) => setSelectedDeal({ ...selectedDeal, value: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold">Contact Phone</label>
                    <input aria-label="Contact" placeholder="Contact" value={selectedDeal.contact} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm" onChange={(e) => setSelectedDeal({ ...selectedDeal, contact: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold">Stage</label>
                    <select aria-label="Stage" value={selectedDeal.stage} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm focus:outline-none focus:border-primary" onChange={(e) => setSelectedDeal({ ...selectedDeal, stage: e.target.value })}>
                      <option value="new">New Lead</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal Sent</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-bold">Notes</label>
                    <textarea placeholder="Add notes..." value={selectedDeal.notes || ""} className="w-full mt-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/60 text-foreground text-sm focus:outline-none focus:border-primary" onChange={(e) => setSelectedDeal({ ...selectedDeal, notes: e.target.value })} />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsEditing(false)} className="w-1/2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition cursor-pointer">Cancel</button>
                  <button onClick={updateDeal} className="w-1/2 bg-gradient-to-r from-primary to-cyan text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition cursor-pointer">Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110]">
          <div className="glass-strong border border-border/80 p-6 rounded-2xl w-full max-w-sm">
            <h2 className="text-lg font-bold text-foreground mb-1">Delete Deal</h2>
            <p className="text-sm text-muted-foreground mb-6">Are you sure you want to permanently delete this deal? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDealToDelete(null); }} className="w-1/2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition cursor-pointer">Cancel</button>
              <button onClick={deleteDeal} className="w-1/2 bg-destructive text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
