import { useState, useEffect, useRef } from "react";
import { Plus, Users, CheckSquare, PlayCircle, Clock, AlertTriangle, Search, Filter, ArrowUpDown } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import KPICard from "@/components/KPICard";

const isOverdue = (date: string) => {
  if (!date) return false;
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsed.setHours(0, 0, 0, 0);
  return parsed < today;
};

const formatDate = (d: any) => {
  if (!d) return "No date";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return d;
  }
};

const priorityColor: any = {
  High: "bg-red-500/20 text-red-400 border border-red-500/30",
  Medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  Low: "bg-green-500/20 text-green-400 border border-green-500/30",
};

const Tasks = () => {
  const notifiedRef = useRef(new Set());
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDueDate, setFilterDueDate] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  // Sorting state
  const [sortBy, setSortBy] = useState("newest");

  const [newTask, setNewTask] = useState({
    text: "",
    description: "",
    assignee: "",
    due: "",
    priority: "Medium",
    relatedLead: "",
    relatedDeal: "",
    reminderDate: "",
    reminderTime: "",
  });

  const fetchTasks = () => {
    authFetch("/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const fixed = data.map((t) => ({ ...t, status: t.status || "todo" }));
          setTasks(fixed);
        }
      })
      .catch((err) => console.log(err));
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
    fetchTasks();
    fetchFiltersData();

    const socket: any = io("http://localhost:5000", { transports: ["websocket"], withCredentials: true });
    socket.on("tasksUpdated", () => {
      fetchTasks();
      toast.success("Tasks updated ⚡");
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const now = new Date();
    tasks.forEach((task) => {
      if (!task.due) return;
      const due = new Date(task.due);
      const todayKey = task._id + "_today";
      if (!task.done && due.toDateString && due.toDateString() === now.toDateString() && !notifiedRef.current.has(todayKey)) {
        toast(`Task due today: ${task.text}`);
        notifiedRef.current.add(todayKey);
      }
      if (task.done) notifiedRef.current.delete(task._id);
    });
  }, [tasks]);

  const addTask = async () => {
    try {
      setLoading(true);
      if (!newTask.text) {
        setLoading(false);
        return alert("Enter task title");
      }
      const today = new Date().toISOString().split("T")[0];
      if (newTask.due && new Date(newTask.due) < new Date(today)) {
        setLoading(false);
        return toast.error("❌ Past date not allowed");
      }

      await authFetch("/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...newTask,
          done: false,
          status: "todo",
          relatedLead: newTask.relatedLead || undefined,
          relatedDeal: newTask.relatedDeal || undefined,
        })
      });

      toast.success("Task added successfully!");
      setIsOpen(false);
      setNewTask({
        text: "",
        description: "",
        assignee: "",
        due: "",
        priority: "Medium",
        relatedLead: "",
        relatedDeal: "",
        reminderDate: "",
        reminderTime: "",
      });
      fetchTasks();
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: string, currentStatus: boolean) => {
    await authFetch(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        done: !currentStatus,
        status: !currentStatus ? "done" : "todo"
      })
    });
    fetchTasks();
  };

  const moveToProgress = async (id: string) => {
    try {
      await authFetch(`/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "progress", done: false })
      });
      toast.success("Moved to Progress");
      fetchTasks();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update status");
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    const id = result.draggableId;
    const newStatus = result.destination.droppableId;
    await authFetch(`/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, done: newStatus === "done" })
    });
    fetchTasks();
  };

  // Filter & Search Logic
  const filtered = tasks.filter((t) => {
    const matchesSearch = t.text.toLowerCase().includes(search.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = filterStatus === "all" ? true :
                          filterStatus === "todo" ? (!t.done && t.status === "todo") :
                          filterStatus === "progress" ? (t.status === "progress") :
                          (t.done || t.status === "done");

    const matchesPriority = filterPriority === "all" ? true : t.priority === filterPriority;

    const matchesAssignee = filterAssignee === "all" ? true : t.assignee === filterAssignee;

    let matchesDueDate = true;
    if (filterDueDate !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = t.due ? new Date(t.due) : null;
      if (!dueDate) {
        matchesDueDate = false;
      } else {
        dueDate.setHours(0, 0, 0, 0);
        if (filterDueDate === "today") {
          matchesDueDate = dueDate.getTime() === today.getTime();
        } else if (filterDueDate === "week") {
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          matchesDueDate = dueDate >= today && dueDate <= nextWeek;
        } else if (filterDueDate === "overdue") {
          matchesDueDate = dueDate < today && !t.done && t.status !== "done";
        }
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesDueDate;
  });

  // Sorting Logic
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }
    if (sortBy === "oldest") {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    }
    if (sortBy === "due") {
      const dateA = a.due ? new Date(a.due).getTime() : Infinity;
      const dateB = b.due ? new Date(b.due).getTime() : Infinity;
      return dateA - dateB;
    }
    if (sortBy === "priority") {
      const priorityWeight = { High: 3, Medium: 2, Low: 1 };
      const valA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
      const valB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
      return valB - valA;
    }
    return 0;
  });

  // KPI calculations
  const totalTasksCount = tasks.length;
  const pendingTasksCount = tasks.filter(t => !t.done && t.status === "todo").length;
  const progressTasksCount = tasks.filter(t => !t.done && t.status === "progress").length;
  const completedTasksCount = tasks.filter(t => t.done || t.status === "done").length;
  const overdueTasksCount = tasks.filter(t => !t.done && t.status !== "done" && isOverdue(t.due)).length;

  return (
    <div className="min-h-[calc(100vh-80px)] px-6 lg:px-8 bg-gradient-to-br from-[#07131c] via-[#061018] to-[#02060a] py-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks Board</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage, prioritize, and track customer follow-ups.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold px-5 py-2.5 rounded-xl text-sm hover-lift hover:opacity-95 transition"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard icon={Users} title="Total Tasks" value={`${totalTasksCount}`} change="0" changeType="up" />
        <KPICard icon={Clock} title="Pending Tasks" value={`${pendingTasksCount}`} change="0" changeType="up" />
        <KPICard icon={PlayCircle} title="In Progress" value={`${progressTasksCount}`} change="0" changeType="up" />
        <KPICard icon={CheckSquare} title="Completed" value={`${completedTasksCount}`} change="0" changeType="up" />
        <KPICard icon={AlertTriangle} title="Overdue Tasks" value={`${overdueTasksCount}`} change="0" changeType="up" />
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/20 p-4 rounded-2xl border border-border/40">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* SEARCH */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white placeholder-muted-foreground"
            />
          </div>

          {/* FILTER BUTTON */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border border-border/50 hover:bg-secondary transition flex items-center gap-2 text-sm font-medium ${
              showFilters ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary/40 text-foreground"
            }`}
          >
            <Filter size={16} /> Filters
          </button>
        </div>

        {/* SORT CONTROL */}
        <div className="flex items-center gap-2 bg-secondary/40 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground">
          <ArrowUpDown size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none focus:outline-none cursor-pointer text-sm text-foreground"
          >
            <option value="newest" className="bg-slate-950 text-white">Newest</option>
            <option value="oldest" className="bg-slate-950 text-white">Oldest</option>
            <option value="due" className="bg-slate-950 text-white">Due Date</option>
            <option value="priority" className="bg-slate-950 text-white">Priority</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {showFilters && (
        <div className="glass p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border border-white/5">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Due Date</label>
            <select
              value={filterDueDate}
              onChange={(e) => setFilterDueDate(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Timeline</option>
              <option value="today">Due Today</option>
              <option value="week">Due This Week</option>
              <option value="overdue">Overdue Tasks</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Assigned User</label>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="w-full bg-slate-900/50 border border-border/50 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="all">All Users</option>
              {users.map(u => (
                <option key={u._id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* KANBAN BOARD */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {["todo", "progress", "done"].map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="glass p-4 rounded-2xl min-h-[450px] border border-border/50 flex flex-col"
                >
                  <h2 className="mb-4 font-semibold capitalize text-base tracking-wide text-foreground border-b border-white/5 pb-2 flex items-center justify-between">
                    <span>
                      {col === "todo" ? "To Do" : col === "progress" ? "In Progress" : "Done"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground font-bold">
                      {
                        sorted.filter((t) => {
                          if (col === "done") return t.done || t.status === "done";
                          if (col === "todo") return !t.done && t.status === "todo";
                          if (col === "progress") return t.status === "progress" && !t.done;
                        }).length
                      }
                    </span>
                  </h2>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[600px] no-scrollbar">
                    {(() => {
                      const colTasks = sorted.filter((t) => {
                        if (col === "done") return t.done || t.status === "done";
                        if (col === "todo") return !t.done && t.status === "todo";
                        if (col === "progress") return t.status === "progress" && !t.done;
                      });

                      if (colTasks.length === 0) {
                        return (
                          <p className="text-xs text-muted-foreground text-center py-10">
                            No tasks in this column.
                          </p>
                        );
                      }

                      return colTasks.map((t, index) => {
                        const isTaskOverdue = !t.done && t.status !== "done" && isOverdue(t.due);
                        return (
                          <Draggable key={t._id} draggableId={t._id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => navigate(`/tasks/${t._id}`)}
                                className={`glass-strong p-4 rounded-xl transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                                  isTaskOverdue
                                    ? "border-2 border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/10"
                                    : "border border-white/5 hover:border-white/25"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <p className="font-semibold text-sm text-foreground flex-1 leading-snug">
                                    {t.text}
                                  </p>
                                  {isTaskOverdue && (
                                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold border border-red-500">
                                      <AlertTriangle size={10} /> OVERDUE
                                    </span>
                                  )}
                                </div>

                                {t.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                    {t.description}
                                  </p>
                                )}

                                <div className="flex justify-between items-center mb-3 text-xs text-slate-300">
                                  <span>👤 {t.assignee || "Unassigned"}</span>
                                  <span className={isTaskOverdue ? "text-red-400 font-medium" : ""}>
                                    📅 {formatDate(t.due)}
                                  </span>
                                </div>

                                {/* Related Lead/Deal tags */}
                                {(t.relatedLead || t.relatedDeal) && (
                                  <div className="flex flex-wrap gap-1.5 mb-3">
                                    {t.relatedLead && (
                                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                                        Lead: {t.relatedLead.name}
                                      </span>
                                    )}
                                    {t.relatedDeal && (
                                      <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                                        Deal: {t.relatedDeal.title}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div className="flex justify-between items-center border-t border-white/5 pt-2.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${priorityColor[t.priority] || "bg-slate-500/10 text-slate-400"}`}>
                                    {t.priority || "Medium"}
                                  </span>

                                  <div className="flex gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
                                    {t.status !== "progress" && !t.done && (
                                      <button
                                        onClick={() => moveToProgress(t._id)}
                                        className="text-primary hover:text-cyan font-medium transition-all"
                                      >
                                        ▶ Start
                                      </button>
                                    )}
                                    <button
                                      onClick={() => toggle(t._id, t.done)}
                                      className="text-slate-400 hover:text-emerald-400 font-medium transition-all"
                                    >
                                      ✓ Complete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      });
                    })()}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* ADD TASK MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-strong w-full max-w-md p-6 rounded-2xl shadow-xl border border-border/50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-5 text-center text-white border-b border-white/5 pb-2">
              Add New Task
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Task Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule introductory demo"
                  value={newTask.text}
                  onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  placeholder="Enter details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary h-20"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Assignee</label>
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="" className="bg-slate-950 text-white">Select Assignee</option>
                  {users.map(u => (
                    <option key={u._id} value={u.name} className="bg-slate-950 text-white">{u.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Due Date</label>
                <div className="w-full">
                  <DatePicker
                    selected={newTask.due ? new Date(newTask.due) : null}
                    onChange={(date) => setNewTask({ ...newTask, due: date?.toISOString().split("T")[0] || "" })}
                    placeholderText="Select due date 📅"
                    dateFormat="dd-MM-yyyy"
                    showPopperArrow={false}
                    popperPlacement="bottom-start"
                    wrapperClassName="w-full"
                    minDate={new Date()}
                    className="w-full h-[44px] px-4 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="Low" className="bg-slate-950 text-white">🟢 Low</option>
                  <option value="Medium" className="bg-slate-950 text-white">🟡 Medium</option>
                  <option value="High" className="bg-slate-950 text-white">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Related Lead</label>
                <select
                  value={newTask.relatedLead}
                  onChange={(e) => setNewTask({ ...newTask, relatedLead: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="" className="bg-slate-950 text-white">Select Related Lead</option>
                  {leads.map(l => (
                    <option key={l._id} value={l._id} className="bg-slate-950 text-white">{l.name} - {l.company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Related Deal</label>
                <select
                  value={newTask.relatedDeal}
                  onChange={(e) => setNewTask({ ...newTask, relatedDeal: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value="" className="bg-slate-950 text-white">Select Related Deal</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id} className="bg-slate-950 text-white">{d.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reminder Date</label>
                  <input
                    type="date"
                    value={newTask.reminderDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setNewTask({ ...newTask, reminderDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Reminder Time</label>
                  <input
                    type="time"
                    value={newTask.reminderTime}
                    onChange={(e) => setNewTask({ ...newTask, reminderTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/50 border border-white/10 text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-white/5 pt-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
