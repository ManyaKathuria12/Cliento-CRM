import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Plus, Shield, Trash2, UserCog } from "lucide-react";
import { getAuthHeaders } from "@/utils/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  disabled?: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", { headers: getAuthHeaders() });
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${id}`, updates, { headers: getAuthHeaders() });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, { headers: getAuthHeaders() });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();

    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socket.on("connect", () => {
      console.log("AdminUsers socket connected", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("AdminUsers socket connect error", err);
    });
    socket.on("dashboardUpdated", () => {
      console.log("AdminUsers received dashboardUpdated");
      fetchUsers();
    });
    socket.on("tasksUpdated", () => {
      console.log("AdminUsers received tasksUpdated");
      fetchUsers();
    });
    socket.on("usersUpdated", () => {
      console.log("AdminUsers received usersUpdated");
      fetchUsers();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-6 text-foreground">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage roles, access, and account state for your CRM team.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
          <Plus size={16} /> Add user
        </button>
      </div>

      <div className="glass rounded-2xl border border-border/50 overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr] gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border/40 bg-background/40">
          <div>Name</div>
          <div>Role</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {users.map((user) => (
          <div key={user._id} className="grid grid-cols-[2fr_1fr_1fr_0.8fr] gap-4 items-center px-4 py-4 border-b border-border/40 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-sm font-bold text-black">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{user.role || "sales"}</span>
            </div>

            <div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${user.disabled ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                {user.disabled ? "Disabled" : "Active"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => updateUser(user._id, { role: user.role === "admin" ? "sales" : "admin" })} className="p-2 rounded-lg border border-border hover:bg-secondary" title="Change role">
                <Shield size={16} />
              </button>
              <button onClick={() => updateUser(user._id, { disabled: !user.disabled })} className="p-2 rounded-lg border border-border hover:bg-secondary" title="Toggle status">
                <UserCog size={16} />
              </button>
              <button onClick={() => deleteUser(user._id)} className="p-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10" title="Delete user">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;