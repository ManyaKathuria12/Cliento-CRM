import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  // 🔥 FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 DELETE USER
  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers(); // refresh list
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>

      <div className="bg-[#0b1a24] border border-white/10 rounded-2xl p-4">
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between py-3 border-b border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center text-black font-bold">
                {user.name.charAt(0)}
              </div>

              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    user.role === "admin"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => deleteUser(user._id)}
              className="text-red-500 hover:text-red-300 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;