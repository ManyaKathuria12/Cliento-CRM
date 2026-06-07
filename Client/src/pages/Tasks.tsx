import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { DragDropContext, Droppable, Draggable, } from "@hello-pangea/dnd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";

const isOverdue = (date: string) => {
  if (!date) return false;

  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return false;

  return parsed < new Date();
};

const getLateDays = (due: string) => {
  if (!due) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(due);
  selected.setHours(0, 0, 0, 0);

  return Math.floor((today.getTime() - selected.getTime()) / (1000 * 60 * 60 * 24));
};


const priorityColor: any = {
  High: "bg-red-500/20 text-red-400",
  Medium: "bg-yellow-500/20 text-yellow-400",
  Low: "bg-green-500/20 text-green-400",
};

const getPriorityScore = (task) => {
  const today = new Date();
  const due = new Date(task.due);

  // normalize date (time ignore)
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  if (due < today) return 0; // 🔴 overdue
  if (due.getTime() === today.getTime()) return 1; // 📅 today
  return 2; // 🟢 upcoming
};

const Tasks = () => {
  const notifiedRef = useRef(new Set());
   const navigate = useNavigate(); 

  const [tasks, setTasks] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);

const [editData, setEditData] = useState({
  text: "",
  assignee: "",
  due: "",
});


  const [newTask, setNewTask] = useState({
    text: "",
    assignee: "",
    due: "",
    priority: "Medium",
  });

const reschedule = async (taskId: string, currentDue: string) => {
  const newDate = prompt("Enter new date (YYYY-MM-DD)");

  if (!newDate || newDate === currentDue) {
    alert("Select different date");
    return;
  }

  await authFetch(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify({ due: newDate }),
  });

  fetchTasks();
};

  // 🔥 FETCH
  const fetchTasks = () => {
  authFetch("/tasks")
      .then((res) => res.json())
      .then((data) => {
  const fixed = data.map((t) => ({
    ...t,
    status: t.status || "todo"
  }));

  console.log("DATA:", fixed);
  setTasks(fixed);
})
      .catch((err) => console.log(err));
  };

  // 🔥 SOCKET
  useEffect(() => {
    fetchTasks();

    const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  withCredentials: true
});

    socket.on("tasksUpdated", () => {
      fetchTasks();
      toast.success("Tasks updated ⚡");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 🔥 OVERDUE + TODAY TOAST FIXED
  useEffect(() => {
    const now = new Date();
    console.log("TASKS:", tasks);

    tasks.forEach((task) => {
      const due = new Date(task.due);

      // 🔴 OVERDUE
     

      // 🟡 TODAY
      const todayKey = task._id + "_today";

      if (
        !task.done &&
        due.toDateString() === now.toDateString() &&
        !notifiedRef.current.has(todayKey)
      ) {
        toast(" Task due today: " + task.text);
        notifiedRef.current.add(todayKey);
      }

      // ✅ cleanup
      if (task.done) {
        notifiedRef.current.delete(task._id);
      }
      
    });
  }, [tasks]);

  // 🔥 ADD / UPDATE
  const addTask = async () => {
  try {
    setLoading(true);

    if (!newTask.text) {
      setLoading(false);
      return alert("Enter task");
    }

     const today = new Date().toISOString().split("T")[0];

   if (newTask.due && new Date(newTask.due) < new Date(today)) {
      setLoading(false);
      return toast.error("❌ Past date not allowed");
    }

    if (editingTask) {
      await authFetch(`/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      toast.success("Task updated!");
    } else {
      await authFetch("/tasks", {
  method: "POST",
  body: JSON.stringify({ ...newTask, done: false, status: "todo" }),
});
      toast.success("Task added!");
    }

    
    setEditingTask(null);
    setIsOpen(false);

    setNewTask({
      text: "",
      assignee: "",
      due: "",
      priority: "Medium",
    });

    fetchTasks();

  } catch (err) {
    console.log(err);
    toast.error("Something went wrong ❌");
  } finally {
    setLoading(false);
  }
};

  // 🔥 TOGGLE
 const toggle = async (id: string, currentStatus: boolean) => {
  await authFetch(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      done: !currentStatus,
      status: !currentStatus ? "done" : "todo",
    }),
  });

  fetchTasks();
};

const moveToProgress = async (id: string) => {
  try {
  await authFetch(`/tasks/${id}`, {
  method: "PUT",
  body: JSON.stringify({
    status: "progress",
    done: false,
  }),
});

    toast.success("Moved to progress");
    fetchTasks();
  } catch (err) {
    console.log(err);
    toast.error("Failed");
  }
  fetchTasks();
};

  // 🔥 DELETE
  const deleteTask = async (id: string) => {
   await authFetch(`/tasks/${id}`, {
  method: "DELETE",
});

    fetchTasks();
  };

  const onDragEnd = async (result) => {
  if (!result.destination) return;

  const id = result.draggableId;
 const newStatus = result.destination.droppableId;

await authFetch(`/tasks/${id}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: newStatus,
    done: newStatus === "done", // 🔥 IMPORTANT
  }),
});
  fetchTasks(); // refresh
};

  return (
    <div className="space-y-4">

  {/* 🔍 SEARCH + BUTTON SAME LINE */}
  <div className="flex justify-between items-center gap-4">

    <input
      placeholder="Search tasks..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-[60%] px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white"
    />

    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white"
    >
      <Plus size={16} /> Add Task
    </button>

  </div>

  {/* 📌 TASKS BELOW */}
  <div>
    <h1 className="text-2xl font-bold">Tasks</h1>
    <p className="text-sm text-muted-foreground">
      {tasks.filter((t) => !t.done).length} pending tasks
    </p>
  </div>

  {/* TASK LIST */}
  <DragDropContext onDragEnd={onDragEnd}>
  <div className="grid grid-cols-3 gap-4">

    {["todo", "progress", "done"].map((col) => (
      <Droppable droppableId={col} key={col}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="glass p-4 rounded-2xl min-h-[350px] border border-border/50"
          >
           {(() => {
 const filteredTasks = tasks
  .filter((t) => {
    if (col === "done") return t.done;
    if (col === "todo") return !t.done && t.status !== "progress";
    if (col === "progress") return t.status === "progress";
  })
  .filter((t) =>
    t.text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <h2 className="mb-4 font-semibold capitalize text-sm tracking-wide text-muted-foreground">
        {col} ({filteredTasks.length})
      </h2>

    {filteredTasks
  .sort((a, b) => {
    const priorityDiff = getPriorityScore(a) - getPriorityScore(b);
    if (priorityDiff !== 0) return priorityDiff;

    const dateA = a.due ? new Date(a.due).getTime() : Infinity;
const dateB = b.due ? new Date(b.due).getTime() : Infinity;

return dateA - dateB;
  })
  .map((t, index) => (
        <Draggable key={t._id} draggableId={t._id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              onClick={() => navigate(`/tasks/${t._id}`)}
              className={`glass-strong p-4 rounded-xl mb-3 hover-lift transition-all 
  ${!t.done && isOverdue(t.due) ? "border border-red-500/40 bg-red-500/5 shadow-red-500/10 shadow-lg" : ""}
`}
            >
              <p className="font-medium text-sm mb-2">{t.text}</p>

              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>👤 {t.assignee || "Unassigned"}</span>
                <span>📅 {t.due || "No date"}</span>
              </div>

{!t.done && isOverdue(t.due) && (
  <div className="text-xs text-red-400 mb-2">
    ⚠ Overdue
  </div>
)}

              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${priorityColor[t.priority]}`}>
                  {t.priority}
                </span>

               <div className="flex gap-3 text-xs">
  {t.status !== "progress" && !t.done && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      moveToProgress(t._id);
    }}
    className="text-muted-foreground/110 hover:text-white transition-all"
  >
    ▶ Start
  </button>
)}

  <button
    onClick={() => toggle(t._id, t.done)}
    className="text-muted-foreground/110 transition-all hover:text-green-300"
  >
    ✔ Done
  </button>

 
</div>
              </div>
            </div>
          )}
        </Draggable>
      ))}

      {filteredTasks.length === 0 && (
        <p className="text-xs text-muted-foreground text-center mt-10">
          No tasks
        </p>
      )}

      {provided.placeholder}
    </>
  );
})()}
          </div>
        )}
      </Droppable>
    ))}

  </div>
</DragDropContext>

      {/* MODAL */}
      {isOpen && (
     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">

  <div className="glass-strong w-[380px] p-6 rounded-2xl shadow-xl border border-border/50">

    {/* HEADER */}
    <h2 className="text-lg font-semibold mb-5 text-center">
      Add Task
    </h2>

    {/* FORM */}
    <div className="space-y-4">

      {/* TASK */}
      <input
        type="text"
        placeholder="Enter task..."
        value={newTask.text}
        onChange={(e) => setNewTask({ ...newTask, text: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* ASSIGNEE */}
      <input
        type="text"
        placeholder="Assign to..."
        value={newTask.assignee}
        onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* DATE */}
<div className="w-full">
  <DatePicker
    selected={newTask.due ? new Date(newTask.due) : null}
    onChange={(date) =>
      setNewTask({
        ...newTask,
        due: date?.toISOString().split("T")[0],
      })
    }
    placeholderText="Select due date 📅"
    dateFormat="dd-MM-yyyy"
    showPopperArrow={false}
    popperPlacement="bottom-start"
    wrapperClassName="w-full"
    minDate={new Date()} 
    
    className="w-full h-[44px] px-4 rounded-lg bg-muted border border-border text-white"
  />
</div>

      {/* PRIORITY */}
      <select
        value={newTask.priority}
        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="Low">🟢 Low</option>
        <option value="Medium">🟡 Medium</option>
        <option value="High">🔴 High</option>
      </select>
    </div>

    {/* BUTTONS */}
    <div className="flex justify-end gap-3 mt-6">

      <button
        onClick={() => setIsOpen(false)}
        className="px-4 py-2 text-sm text-muted-foreground hover:text-white transition"
      >
        Cancel
      </button>

      <button
  onClick={addTask}
  disabled={loading}
  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
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