import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";
import { ArrowLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";



const isOverdue = (date: string) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const formatDateFriendly = (d?: string) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return d;
  }
};

const getLateDays = (due: string) => {
  const today = new Date();
  const dueDate = new Date(due);

  today.setHours(0,0,0,0);
  dueDate.setHours(0,0,0,0);

  return Math.floor((today.getTime() - dueDate.getTime()) / (1000*60*60*24));
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

const [editData, setEditData] = useState({
  text: "",
  assignee: "",
  due: "",
});

  // Hook state for reschedule modal — keep hooks at top-level
  const [showReschedule, setShowReschedule] = useState(false);
  const [newDue, setNewDue] = useState("");

  const todayISO = new Date().toISOString().split("T")[0];

  useEffect(() => {
    authFetch("/tasks")
      .then(res => res.json())
      .then(data => {
       const found = data.find((t:any) => t._id === id);

if (found) {
  setTask(found);

  setEditData({
    text: found.text || "",
    assignee: found.assignee || "",
    due: found.due || "",
  });
}
      });
  }, [id]);

  if (!task) return <p>Loading...</p>;

 const updateTask = async () => {
  const res = await authFetch(`/tasks/${task._id}`, {
    method: "PUT",
    body: JSON.stringify(editData),
  });

  if (res.ok) {
    setIsEditing(false);
    navigate("/tasks");
  } else {
    alert("Update failed");
  }
};

const reschedule = async () => {
  const newDate = prompt("Enter new date (YYYY-MM-DD)");

  if (!newDate) return;

  await authFetch(`/tasks/${task._id}`, {
    method: "PUT",
    body: JSON.stringify({ due: newDate }), // 👈 adjust if needed
  });

  navigate("/tasks");
};

const deleteTask = async () => {
  if (!confirm("Delete task?")) return;

  const res = await authFetch(`/tasks/${task._id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    navigate("/tasks");
  } else {
    alert("Delete failed");
  }
};

const markDone = async () => {
  const res = await authFetch(`/tasks/${task._id}`, {
    method: "PUT",
    body: JSON.stringify({ done: true, status: "done" }),
  });

  if (res.ok) {
    navigate("/tasks"); // refresh list
  } else {
    alert("Failed to update");
  }
};

  const openReschedule = () => {
    setNewDue(task.due ? task.due.split("T")[0] : todayISO);
    setShowReschedule(true);
  };

  const saveReschedule = async () => {
    if (!newDue) return;
    // Prevent past dates
    if (newDue < todayISO) return;

    await authFetch(`/tasks/${task._id}`, {
      method: "PUT",
      body: JSON.stringify({ due: newDue }),
    });

    setShowReschedule(false);
    navigate("/tasks");
  };

  return (
  <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-gradient-to-br from-[#07131c] via-[#061018] to-[#02060a]">

    <div className="w-full max-w-3xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-transform">

      {/* BACK */}
     <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-2 text-base font-medium text-gray-400 hover:text-cyan-400 mb-6 transition"
>
  <ArrowLeft size={24} />
  Back
</button>

      {/* TITLE */}
     {!isEditing ? (
  <>
    <h1 className="text-4xl font-extrabold text-white mb-4 leading-snug">
      {task.text}
    </h1>

    <p className="text-sm text-muted-foreground mb-4">Task Information</p>

    <div className="glass p-4 rounded-xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <p className="text-xs text-gray-400">Status</p>
        <p className="text-white">{task.status || (task.done ? 'done' : 'todo')}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Priority</p>
        <p className="text-white">{task.priority || 'Medium'}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Assigned To</p>
        <p className="text-white">{task.assignee || 'Unassigned'}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Due Date</p>
        <p className="text-white">{formatDateFriendly(task.due)}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Created</p>
        <p className="text-white">{formatDateFriendly(task.createdAt || task._id && undefined)}</p>
      </div>

      <div>
        <p className="text-xs text-gray-400">Last Updated</p>
        <p className="text-white">{formatDateFriendly(task.updatedAt)}</p>
      </div>
    </div>
  </>
) : (
  <>
    <div className="grid grid-cols-1 gap-3 mb-4">
      <label htmlFor="edit-text" className="text-xs text-gray-400">Task Name</label>
      <input
        value={editData.text}
        onChange={(e) =>
          setEditData({ ...editData, text: e.target.value })
        }
        id="edit-text"
        className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
      />

      <label htmlFor="edit-assignee" className="text-xs text-gray-400">Assigned To</label>
      <input
        value={editData.assignee}
        onChange={(e) =>
          setEditData({ ...editData, assignee: e.target.value })
        }
        id="edit-assignee"
        className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
      />

      <label htmlFor="edit-due" className="text-xs text-gray-400">Due Date</label>
      <input
        type="date"
        value={editData.due}
        min={todayISO}
        onChange={(e) =>
          setEditData({ ...editData, due: e.target.value })
        }
        id="edit-due"
        className="w-full p-2 rounded bg-white/5 border border-white/10 text-white"
      />
    </div>
  </>
)}

      {/* BADGES */}
      <div className="flex items-center justify-start gap-3 mb-6 flex-wrap">
        <span className="px-3 py-1 text-xs rounded-full bg-red-500/20 text-red-300">{task.priority || "Medium"}</span>
        {!task.done ? (
          <span className="px-3 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">Pending</span>
        ) : (
          <span className="px-3 py-1 text-xs rounded-full bg-green-500/20 text-green-300">✔ Done</span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

  {!isEditing ? (
    <>
      <button onClick={() => setIsEditing(true)} className="col-span-1 sm:col-span-1 w-full py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10">Edit</button>

      {!task.done && (
        <button onClick={markDone} className="col-span-1 sm:col-span-1 w-full py-2 rounded-xl bg-primary text-primary-foreground">Done</button>
      )}

      <button onClick={openReschedule} className="col-span-1 sm:col-span-1 w-full py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10">Reschedule</button>

      <button onClick={deleteTask} className="col-span-1 sm:col-span-1 w-full py-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/25">Delete</button>
    </>
  ) : (
    <>
      <button onClick={() => setIsEditing(false)} className="col-span-1 sm:col-span-2 w-full py-2 rounded-xl bg-gray-500/20 text-gray-300">Cancel</button>

      <button onClick={updateTask} className="col-span-1 sm:col-span-2 w-full py-2 rounded-xl bg-primary text-primary-foreground">Save</button>
    </>
  )}

</div>

    {/* Reschedule Dialog */}
    <Dialog open={showReschedule} onOpenChange={setShowReschedule}>
      {showReschedule && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Task</DialogTitle>
            <DialogDescription>Adjust the due date for this task.</DialogDescription>
          </DialogHeader>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Current Due Date</p>
            <p className="text-white mb-3">{formatDateFriendly(task.due)}</p>

            <label htmlFor="reschedule-due" className="text-xs text-gray-400">New Due Date</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-white/5 border border-white/10 text-white mt-1"
              value={newDue}
              min={todayISO}
              id="reschedule-due"
              onChange={(e) => setNewDue(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <div className="flex gap-2 w-full">
              <button onClick={() => setShowReschedule(false)} className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300">Cancel</button>
              <button onClick={saveReschedule} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground">Save</button>
            </div>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>

    </div>

  
  </div>
  
);
}