import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../utils/api";



const isOverdue = (date: string) => {
  if (!date) return false;
  return new Date(date) < new Date();
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

return (
  <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 bg-gradient-to-br from-[#07131c] via-[#061018] to-[#02060a]">

    <div className="w-full max-w-xl backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-lg">

      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-400 hover:text-white mb-6"
      >
        ← Back
      </button>

      {/* TITLE */}
     {!isEditing ? (
  <>
    <h1 className="text-3xl font-bold text-white mb-6">
      {task.text}
    </h1>

    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
        <p className="text-xs text-gray-400">Assigned</p>
        <p className="text-white">{task.assignee}</p>
      </div>

      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
        <p className="text-xs text-gray-400">Due Date</p>
        <p className="text-white">{task.due}</p>
      </div>
    </div>
  </>
) : (
  <>
    <input
      value={editData.text}
      onChange={(e) =>
        setEditData({ ...editData, text: e.target.value })
      }
      className="w-full mb-4 p-2 rounded bg-white/5 border border-white/10 text-white"
    />

    <input
      value={editData.assignee}
      onChange={(e) =>
        setEditData({ ...editData, assignee: e.target.value })
      }
      className="w-full mb-4 p-2 rounded bg-white/5 border border-white/10 text-white"
    />

  <input
  type="date"
  value={editData.due}
  min={new Date().toISOString().split("T")[0]}   // 👈 ADD THIS
  onChange={(e) =>
    setEditData({ ...editData, due: e.target.value })
  }
  className="w-full mb-4 p-2 rounded bg-white/5 border border-white/10 text-white"
/>
  </>
)}

      {/* BADGES */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-300">
          {task.priority || "Medium"}
        </span>

        {task.done ? (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-300">
            ✔ Done
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-300">
            Pending
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 flex-wrap">

  {!isEditing ? (
    <>
      <button
        onClick={() => setIsEditing(true)}
        className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
      >
        Edit
      </button>

      <button
        onClick={markDone}
        className="flex-1 py-2 rounded-xl bg-white/10 text-white border border-white/20 hover:bg-white/20"
      >
        Done
      </button>

      <button
        onClick={reschedule}
        className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
      >
        Reschedule
      </button>

      <button
        onClick={deleteTask}
        className="flex-1 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
      >
        Delete
      </button>
    </>
  ) : (
    <>
      <button
        onClick={updateTask}
        className="flex-1 py-2 rounded-xl bg-blue-500/20 text-blue-300"
      >
        Save
      </button>

      <button
        onClick={() => setIsEditing(false)}
        className="flex-1 py-2 rounded-xl bg-gray-500/20 text-gray-300"
      >
        Cancel
      </button>
    </>
  )}

</div>

    </div>

  
  </div>
  
);
}