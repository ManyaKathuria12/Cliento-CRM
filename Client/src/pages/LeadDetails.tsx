import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthHeaders } from "@/utils/api";
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

interface Lead {
  _id: string;
  name: string;
  company: string;
  phone: string;
  city: string;
  email?: string;
  source?: string;
  status?: string;
  priority?: string;
  score?: number;
  temperature?: string;
  notesList?: Array<{ _id: string; text: string; date: string }>;
  followups?: Array<{ _id: string; text: string; date: string; method: string }>;
  upcomingTasks?: Array<{ _id: string; text: string; due?: string; done: boolean }>;
  activity?: Array<{ _id: string; action: string; timestamp: string }>;
  dealId?: string;
  dealTitle?: string;
  createdAt?: string;
}

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Inputs for additions
  const [noteText, setNoteText] = useState("");
  const [followupText, setFollowupText] = useState("");
  const [followupMethod, setFollowupMethod] = useState("Phone");
  const [taskText, setTaskText] = useState("");
  const [taskDue, setTaskDue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    city: "",
    email: "",
    source: "",
    priority: "Medium",
    score: 50,
    temperature: "Warm"
  });

  const fetchLead = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/leads/${id}`,
        { headers: getAuthHeaders() }
      );

      setLead(res.data);

      setFormData({
        name: res.data.name || "",
        company: res.data.company || "",
        phone: res.data.phone || "",
        city: res.data.city || "",
        email: res.data.email || "",
        source: res.data.source || "",
        priority: res.data.priority || "Medium",
        score: res.data.score !== undefined ? res.data.score : 50,
        temperature: res.data.temperature || "Warm"
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, []);

  const saveLead = async () => {
    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/leads/${id}`,
        {
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
          city: formData.city,
          email: formData.email,
          source: formData.source,
          priority: formData.priority,
          score: formData.score,
          temperature: formData.temperature
        },
        { headers: getAuthHeaders() }
      );

      setLead(res.data);
      setIsEditOpen(false);
      alert("Lead Updated Successfully ✅");
    } catch (err) {
      console.log(err);
      alert("Update Failed ❌");
    }
  };

  const handleConvert = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/deals",
        {
          leadId: lead?._id,
          title: `${lead?.name} Deal`,
          company: lead?.company,
          value: 50000,
          contact: lead?.phone,
          stage: "New Lead",
        },
        { headers: getAuthHeaders() }
      );

      if (res.data?.message === "ALREADY_CONVERTED") {
        alert("This lead is already converted.");
        return;
      }

      alert("Lead converted successfully ✅");
      fetchLead();
    } catch (err) {
      console.log(err);
      alert("Conversion failed ❌");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/leads/${id}`,
        { headers: getAuthHeaders() }
      );
      alert("Lead deleted successfully");
      navigate("/leads");
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // Add notes, followups, tasks
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/leads/${id}/notes`,
        { text: noteText },
        { headers: getAuthHeaders() }
      );
      setLead(res.data);
      setNoteText("");
      alert("Note added successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to add note ❌");
    }
  };

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupText.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/leads/${id}/followups`,
        { text: followupText, method: followupMethod },
        { headers: getAuthHeaders() }
      );
      setLead(res.data);
      setFollowupText("");
      alert("Follow-up history added successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to add follow-up ❌");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;
    try {
      const res = await axios.post(
        `http://localhost:5000/api/leads/${id}/tasks`,
        { text: taskText, due: taskDue || undefined },
        { headers: getAuthHeaders() }
      );
      setLead(res.data);
      setTaskText("");
      setTaskDue("");
      alert("Upcoming task added successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to add task ❌");
    }
  };

  const handleToggleTask = async (taskId: string, currentDone: boolean) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/leads/${id}/tasks/${taskId}`,
        { done: !currentDone },
        { headers: getAuthHeaders() }
      );
      setLead(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to update task ❌");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading...
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20 text-red-500">
        Lead not found
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/leads")}
            className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-white">
                {lead.name}
              </h1>

              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                lead.status?.toLowerCase() === "new" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                lead.status?.toLowerCase() === "contacted" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                lead.status?.toLowerCase() === "qualified" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                lead.status?.toLowerCase() === "converted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {lead.status || "new"}
              </span>
            </div>

            <p className="text-gray-400 mt-1">
              {lead.company}
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setIsEditOpen(true)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
              >
                Edit Lead
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Delete Lead
              </button>

              <button
                onClick={handleConvert}
                disabled={lead.status === "converted"}
                className={`px-5 py-2 rounded-xl text-white font-medium transition ${
                  lead.status === "converted"
                    ? "bg-slate-700 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-400"
                }`}
              >
                {lead.status === "converted"
                  ? "Already Converted"
                  : "Convert To Deal"}
              </button>
            </div>
          </div>
        </div>

        {/* Converted Deal Section */}
        {lead.status === "converted" && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 glass flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
                ✓
              </div>
              <div>
                <p className="text-sm text-emerald-400 font-semibold">Status: Converted ✅</p>
                <h3 className="text-lg font-bold text-white mt-0.5">Linked Deal: {lead.dealTitle || `${lead.name} Deal`}</h3>
              </div>
            </div>
            {lead.dealId && (
              <button
                onClick={() => navigate(`/deals?dealId=${lead.dealId}`)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition text-white font-semibold text-sm flex items-center gap-2 hover-lift"
              >
                View Deal
              </button>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Basic & CRM Info Cards */}
          <div className="space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white">Lead Info</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-cyan-400"><Building2 size={16} /></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Company</span>
                    <span className="text-white font-medium">{lead.company}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-cyan-400"><Phone size={16} /></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Phone</span>
                    <span className="text-white font-medium">{lead.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-cyan-400"><MapPin size={16} /></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">City</span>
                    <span className="text-white font-medium">{lead.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-cyan-400"><Mail size={16} /></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Email</span>
                    <span className="text-white font-medium">{lead.email || "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-cyan-400"><User size={16} /></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Source</span>
                    <span className="text-white font-medium">{lead.source || "-"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-cyan-400"><Calendar size={16} /></div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Created</span>
                    <span className="text-white font-medium">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scores Card */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white">CRM Evaluation</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Lead Score</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-secondary/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          (lead.score || 50) >= 75 ? "bg-rose-500" :
                          (lead.score || 50) >= 40 ? "bg-amber-500" :
                          "bg-blue-500"
                        }`}
                        style={{ width: `${lead.score || 50}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-white">{lead.score || 50}/100</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Lead Temperature</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    lead.temperature === "Hot" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    lead.temperature === "Warm" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}>
                    {lead.temperature || "Warm"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block mb-1.5">Priority</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                    lead.priority === "High" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                    lead.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                  }`}>
                    {lead.priority || "Medium"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Notes, Tasks, Followups & Activity */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Notes Section */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white">Notes</h3>
              
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a new note..."
                  className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-cyan text-primary-foreground font-semibold text-sm transition"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {!lead.notesList || lead.notesList.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
                ) : (
                  [...lead.notesList].reverse().map((n: any, idx) => (
                    <div key={n._id || idx} className="p-3 bg-secondary/20 rounded-xl border border-white/5">
                      <p className="text-sm text-slate-200">{n.text}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {new Date(n.date).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Tasks Section */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white">Upcoming Tasks</h3>
              
              <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
                <input
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  placeholder="Task description..."
                  className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <input
                  type="date"
                  value={taskDue}
                  onChange={(e) => setTaskDue(e.target.value)}
                  className="bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-cyan text-primary-foreground font-semibold text-sm transition"
                >
                  Add Task
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {!lead.upcomingTasks || lead.upcomingTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No upcoming tasks.</p>
                ) : (
                  [...lead.upcomingTasks].reverse().map((t: any) => (
                    <div key={t._id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={t.done}
                          onChange={() => handleToggleTask(t._id, t.done)}
                          className="accent-primary h-4 w-4 cursor-pointer"
                        />
                        <span className={`text-sm ${t.done ? "line-through text-muted-foreground" : "text-slate-200"}`}>
                          {t.text}
                        </span>
                      </div>
                      {t.due && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(t.due).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Follow-up History Section */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white">Follow-up History</h3>
              
              <form onSubmit={handleAddFollowup} className="flex flex-col sm:flex-row gap-2">
                <input
                  value={followupText}
                  onChange={(e) => setFollowupText(e.target.value)}
                  placeholder="Follow-up summary..."
                  className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                />
                <select
                  value={followupMethod}
                  onChange={(e) => setFollowupMethod(e.target.value)}
                  className="bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="Phone">Phone</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Chat">Chat</option>
                  <option value="Other">Other</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-cyan text-primary-foreground font-semibold text-sm transition"
                >
                  Log
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {!lead.followups || lead.followups.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No follow-up logged yet.</p>
                ) : (
                  [...lead.followups].reverse().map((f: any, idx) => (
                    <div key={f._id || idx} className="p-3 bg-secondary/20 rounded-xl border border-white/5 flex justify-between items-start">
                      <div>
                        <p className="text-sm text-slate-200">{f.text}</p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {new Date(f.date).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                        {f.method}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h2 className="text-xl font-semibold mb-2">
                Activity Timeline
              </h2>

              <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-5">
                {!lead.activity || lead.activity.length === 0 ? (
                  <div className="relative">
                    <div className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border border-primary bg-slate-900"></div>
                    <p className="text-sm text-slate-200 font-medium">Lead Created</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "-"}
                    </p>
                  </div>
                ) : (
                  [...lead.activity].reverse().map((act: any, idx) => (
                    <div key={act._id || idx} className="relative">
                      <div className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border border-primary bg-slate-900"></div>
                      <p className={`text-sm font-semibold ${
                        act.action === "Converted to Deal" ? "text-emerald-400 font-bold" :
                        act.action === "Status Changed" ? "text-cyan-400 font-bold" :
                        "text-slate-200"
                      }`}>
                        {act.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(act.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#071321] border border-slate-700 rounded-xl p-6 w-[450px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-5">
              Edit Lead
            </h2>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Company</label>
                <input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Company"
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="Phone"
                  inputMode="numeric"
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">City</label>
                <input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  type="email"
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select Source</option>
                  <option value="Website">Website</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Temperature</label>
                <select
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="Cold">Cold</option>
                  <option value="Warm">Warm</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-slate-800 pt-4">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-5 py-2.5 rounded bg-cyan-500 text-white hover:bg-cyan-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveLead}
                className="px-5 py-2.5 rounded bg-slate-700 hover:bg-slate-600 text-white transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[400px]">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Lead
            </h3>

            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this lead?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
              >
                Delete
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadDetails;