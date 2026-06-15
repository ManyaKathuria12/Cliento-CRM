import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, Send, Plus, Trash2, Calendar, FileText, CheckSquare, PlusSquare } from "lucide-react";

const formatDateFriendly = (d?: string) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return d;
  }
};

const isOverdue = (date: string) => {
  if (!date) return false;
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed < today;
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Filters data for selectors
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);

  // Input states
  const [noteText, setNoteText] = useState("");
  const [checklistText, setChecklistText] = useState("");

  const [editData, setEditData] = useState({
    text: "",
    description: "",
    assignee: "",
    priority: "Medium",
    status: "todo",
    due: "",
    relatedLead: "",
    relatedDeal: "",
    reminderDate: "",
    reminderTime: "",
  });

  // Modal / Confirm States
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDue, setNewDue] = useState("");
  const [rescheduleError, setRescheduleError] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);

  const todayISO = new Date().toISOString().split("T")[0];

  const fetchTaskDetails = () => {
    authFetch(`/tasks/${id}`)
      .then(res => res.json())
      .then(data => {
        setTask(data);
        setEditData({
          text: data.text || "",
          description: data.description || "",
          assignee: data.assignee || "",
          priority: data.priority || "Medium",
          status: data.status || "todo",
          due: data.due || "",
          relatedLead: data.relatedLead?._id || data.relatedLead || "",
          relatedDeal: data.relatedDeal?._id || data.relatedDeal || "",
          reminderDate: data.reminderDate || "",
          reminderTime: data.reminderTime || "",
        });
      })
      .catch(err => console.log(err));
  };

  const fetchFiltersData = () => {
    authFetch("/users")
      .then(res => res.json())
      .then(data => setUsers(data || []))
      .catch(err => console.log(err));

    authFetch("/leads")
      .then(res => res.json())
      .then(data => setLeads(data || []))
      .catch(err => console.log(err));

    authFetch("/deals")
      .then(res => res.json())
      .then(data => setDeals(data || []))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchTaskDetails();
    fetchFiltersData();
  }, [id]);

  if (!task) {
    return (
      <div className="min-h-screen bg-[#07131c] flex items-center justify-center">
        <p className="text-slate-400">Loading task details...</p>
      </div>
    );
  }

  const updateTask = async () => {
    const res = await authFetch(`/tasks/${task._id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...editData,
        relatedLead: editData.relatedLead || undefined,
        relatedDeal: editData.relatedDeal || undefined,
      }),
    });

    if (res.ok) {
      setIsEditing(false);
      fetchTaskDetails();
      toast.success("Task updated successfully!");
    } else {
      alert("Update failed");
    }
  };

  const confirmDeleteTask = async () => {
    const res = await authFetch(`/tasks/${task._id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setShowDeleteConfirm(false);
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } else {
      alert("Delete failed");
    }
  };

  const confirmMarkDone = async () => {
    const res = await authFetch(`/tasks/${task._id}`, {
      method: "PUT",
      body: JSON.stringify({ done: true, status: "done" }),
    });

    if (res.ok) {
      setShowCompleteConfirm(false);
      fetchTaskDetails();
      toast.success("Task completed!");
    } else {
      alert("Failed to update task status");
    }
  };

  const saveReschedule = async () => {
    if (!newDue) return;
    if (newDue < todayISO) {
      setRescheduleError("Past dates are not allowed. Please select a valid future date.");
      return;
    }

    const res = await authFetch(`/tasks/${task._id}`, {
      method: "PUT",
      body: JSON.stringify({ due: newDue }),
    });

    if (res.ok) {
      setShowReschedule(false);
      setRescheduleError("");
      fetchTaskDetails();
      toast.success("Task rescheduled!");
    }
  };

  // Add notes & checklist
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      const res = await authFetch(`/tasks/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ text: noteText }),
      });
      if (res.ok) {
        setNoteText("");
        fetchTaskDetails();
        toast.success("Note added");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistText.trim()) return;
    try {
      const res = await authFetch(`/tasks/${id}/checklist`, {
        method: "POST",
        body: JSON.stringify({ text: checklistText }),
      });
      if (res.ok) {
        setChecklistText("");
        fetchTaskDetails();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleToggleChecklistItem = async (itemId: string, done: boolean) => {
    try {
      const res = await authFetch(`/tasks/${id}/checklist/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ done }),
      });
      if (res.ok) {
        fetchTaskDetails();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleLoadChecklistTemplate = async () => {
    const items = ["Initial Call", "Proposal Sent", "Follow-up", "Meeting Scheduled"];
    try {
      for (const item of items) {
        await authFetch(`/tasks/${id}/checklist`, {
          method: "POST",
          body: JSON.stringify({ text: item }),
        });
      }
      fetchTaskDetails();
      toast.success("CRM checklist template loaded");
    } catch (err) {
      console.log(err);
    }
  };

  // Checklist Calculations
  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const completedChecklist = task.checklist ? task.checklist.filter((c: any) => c.done).length : 0;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const isTaskOverdue = !task.done && task.status !== "done" && isOverdue(task.due);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#07131c] via-[#061018] to-[#02060a] py-8 px-4 flex justify-center items-start">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={18} />
            Back to Board
          </button>

          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              task.priority === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
              task.priority === "Medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
              "bg-green-500/10 text-green-400 border-green-500/20"
            }`}>
              {task.priority || "Medium"} Priority
            </span>

            <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
              task.status === "done" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
              task.status === "progress" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
              "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}>
              Status: {task.status || "todo"}
            </span>
          </div>
        </div>

        {/* Overdue Warning Alert */}
        {isTaskOverdue && (
          <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20 text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>This task is overdue! The scheduled due date has passed.</span>
          </div>
        )}

        {/* Main Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Block: Task Overview (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
              
              {!isEditing ? (
                <div className="space-y-4">
                  <h1 className="text-3xl font-extrabold text-white leading-snug">
                    {task.text}
                  </h1>

                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Description</p>
                    <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                      {task.description || "No description provided."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Task Title</label>
                    <input
                      value={editData.text}
                      onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                      className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Description</label>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Assignee</label>
                      <select
                        value={editData.assignee}
                        onChange={(e) => setEditData({ ...editData, assignee: e.target.value })}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select Assignee</option>
                        {users.map(u => (
                          <option key={u._id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Priority</label>
                      <select
                        value={editData.priority}
                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Related Lead</label>
                      <select
                        value={editData.relatedLead}
                        onChange={(e) => setEditData({ ...editData, relatedLead: e.target.value })}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select Lead</option>
                        {leads.map(l => (
                          <option key={l._id} value={l._id}>{l.name} - {l.company}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Related Deal</label>
                      <select
                        value={editData.relatedDeal}
                        onChange={(e) => setEditData({ ...editData, relatedDeal: e.target.value })}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select Deal</option>
                        {deals.map(d => (
                          <option key={d.id} value={d.id}>{d.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Reminder Date</label>
                      <input
                        type="date"
                        value={editData.reminderDate}
                        onChange={(e) => setEditData({ ...editData, reminderDate: e.target.value })}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Reminder Time</label>
                      <input
                        type="time"
                        value={editData.reminderTime}
                        onChange={(e) => setEditData({ ...editData, reminderTime: e.target.value })}
                        className="w-full p-3 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 border-t border-white/5 pt-4">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                    >
                      Edit
                    </button>
                    {!task.done && (
                      <button
                        onClick={() => setShowCompleteConfirm(true)}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-cyan text-primary-foreground font-semibold transition"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setNewDue(task.due || todayISO);
                        setShowReschedule(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold border border-red-500/20 transition ml-auto"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateTask}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-cyan text-primary-foreground font-semibold transition"
                    >
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Checklist Section */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckSquare size={18} className="text-cyan-400" /> Task Checklist
                </h3>
                
                {totalChecklist === 0 && (
                  <button
                    onClick={handleLoadChecklistTemplate}
                    className="text-xs text-primary hover:text-cyan font-semibold flex items-center gap-1 border border-primary/20 bg-primary/10 rounded-lg px-2.5 py-1"
                  >
                    <PlusSquare size={12} /> Load standard template
                  </button>
                )}
              </div>

              {totalChecklist > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-300">
                    <span>Progress: {completedChecklist}/{totalChecklist} items completed</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  value={checklistText}
                  onChange={(e) => setChecklistText(e.target.value)}
                  placeholder="Add a new checklist task..."
                  className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-cyan text-primary-foreground text-sm font-semibold transition"
                >
                  Add
                </button>
              </form>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {totalChecklist === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No checklist items added.</p>
                ) : (
                  task.checklist.map((item: any) => (
                    <div key={item._id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklistItem(item._id, !item.done)}
                          className="accent-primary h-4 w-4 cursor-pointer"
                        />
                        <span className={`text-sm ${item.done ? "line-through text-muted-foreground" : "text-slate-200"}`}>
                          {item.text}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-cyan-400" /> Notes & Updates
              </h3>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Share a progress update..."
                  className="flex-1 bg-slate-900/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-cyan text-primary-foreground text-sm font-semibold transition"
                >
                  Add Note
                </button>
              </form>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {!task.notes || task.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No notes posted yet.</p>
                ) : (
                  [...task.notes].reverse().map((n: any, idx) => (
                    <div key={n._id || idx} className="p-3 bg-secondary/20 rounded-xl border border-white/5">
                      <p className="text-sm text-slate-200">{n.text}</p>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-2 border-t border-white/5 pt-1">
                        <span>By {n.author || "System User"}</span>
                        <span>{new Date(n.date).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Block: Task Metadata & Activity Timeline (1 Column) */}
          <div className="space-y-6">
            
            {/* Task Details Card */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white">Task Metadata</h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Assigned User</span>
                  <span className="text-white font-medium">{task.assignee || "Unassigned"}</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block">Due Date</span>
                  <span className={`text-white font-medium ${isTaskOverdue ? "text-red-400" : ""}`}>
                    {formatDateFriendly(task.due)}
                  </span>
                </div>

                {task.reminderDate && (
                  <div>
                    <span className="text-xs text-muted-foreground block">Reminder Set</span>
                    <span className="text-slate-300 font-medium flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {formatDateFriendly(task.reminderDate)} {task.reminderTime && `at ${task.reminderTime}`}
                    </span>
                  </div>
                )}

                {task.relatedLead && (
                  <div>
                    <span className="text-xs text-muted-foreground block">Related Lead</span>
                    <button
                      onClick={() => navigate(`/leads/${task.relatedLead._id || task.relatedLead}`)}
                      className="text-cyan-400 font-semibold hover:underline text-left mt-0.5 block"
                    >
                      🔗 {task.relatedLead.name || "View Lead Details"}
                    </button>
                  </div>
                )}

                {task.relatedDeal && (
                  <div>
                    <span className="text-xs text-muted-foreground block">Related Deal</span>
                    <button
                      onClick={() => navigate(`/deals?dealId=${task.relatedDeal._id || task.relatedDeal}`)}
                      className="text-purple-400 font-semibold hover:underline text-left mt-0.5 block"
                    >
                      🔗 {task.relatedDeal.title || "View Deal Details"}
                    </button>
                  </div>
                )}

                <div className="border-t border-white/5 pt-3">
                  <span className="text-xs text-muted-foreground block">Created Date</span>
                  <span className="text-slate-300 text-xs">
                    {task.createdAt ? new Date(task.createdAt).toLocaleString() : formatDateFriendly(task._id && undefined)}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground block">Last Updated</span>
                  <span className="text-slate-300 text-xs">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : formatDateFriendly(task.updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Task Completed Metadata banner */}
            {task.done && (
              <div className="glass p-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle size={16} /> Completed
                </div>
                <div className="text-xs space-y-1 text-slate-300">
                  <p><span className="text-muted-foreground">Completed By:</span> {task.completedBy || "System User"}</p>
                  <p><span className="text-muted-foreground">Completed At:</span> {task.completedAt ? new Date(task.completedAt).toLocaleString() : "-"}</p>
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" /> Activity Timeline
              </h3>
              <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-5">
                {!task.activity || task.activity.length === 0 ? (
                  <div className="relative">
                    <div className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border border-primary bg-slate-900"></div>
                    <p className="text-sm text-slate-200 font-medium">Task Created</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.createdAt ? new Date(task.createdAt).toLocaleString() : "Initial stage"}
                    </p>
                  </div>
                ) : (
                  [...task.activity].reverse().map((act: any, idx) => (
                    <div key={act._id || idx} className="relative">
                      <div className="absolute -left-[26px] top-1.5 h-3 w-3 rounded-full border border-primary bg-slate-900"></div>
                      <p className={`text-sm font-semibold ${
                        act.action === "Completed" ? "text-emerald-400 font-bold" :
                        act.action === "Rescheduled" ? "text-amber-400" :
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

      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[400px]">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" /> Complete Task
            </h3>
            <p className="text-gray-400 mb-6">Are you sure you want to mark this task as complete?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmMarkDone}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition"
              >
                Confirm Complete
              </button>
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[400px]">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Trash2 size={18} className="text-red-500" /> Delete Task
            </h3>
            <p className="text-gray-400 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmDeleteTask}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-[400px] space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" /> Reschedule Task
            </h3>
            
            <p className="text-xs text-slate-400">Current Scheduled Due Date: {formatDateFriendly(task.due)}</p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">New Due Date</label>
              <input
                type="date"
                className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 text-white text-sm"
                value={newDue}
                min={todayISO}
                onChange={(e) => {
                  setNewDue(e.target.value);
                  setRescheduleError("");
                }}
              />
            </div>

            {rescheduleError && (
              <p className="text-xs text-red-400 font-semibold">{rescheduleError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleError("");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={saveReschedule}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-cyan text-primary-foreground font-semibold text-sm transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}