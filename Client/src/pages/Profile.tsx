import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";

const Profile = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const [user, setUser] = useState(storedUser);
  const [isEditing, setIsEditing] = useState(false);

  // 🔥 SAFETY (important)
  if (!user) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  // 🔥 SAVE NAME
  const handleSave = async () => {
    if (!user?._id) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/auth/profile/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );

      const updatedUser = await res.json();

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 IMAGE UPLOAD
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      const updated = {
        ...user,
        avatar: data.file,
      };

      // ✅ FIXED (_id instead of sub)
      await fetch(
        `http://localhost:5000/api/auth/profile/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updated),
        }
      );

      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* TOP */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-border/50">
        <Logo size="sm" />
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-primary hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* CARD */}
      <div className="flex items-center justify-center mt-16 px-4">
        <div className="w-full max-w-md p-6 rounded-2xl glass glow-cyan space-y-5">

          <h1 className="text-2xl font-bold text-center">
            Your Profile 👤
          </h1>

          {/* IMAGE */}
          <div className="flex flex-col items-center gap-3">

            {user?.avatar ? (
              <img
                src={`http://localhost:5000/uploads/${user.avatar}`}
                className="w-20 h-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-cyan flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <input
              type="file"
              onChange={handleUpload}
              className="text-sm text-muted-foreground"
            />
          </div>

          {/* INFO */}
          <div className="space-y-3 text-center">

            {isEditing ? (
              <input
                value={user?.name || ""}
                onChange={(e) =>
                  setUser({
                    ...(user || {}),
                    name: e.target.value,
                  })
                }
                className="w-full p-2 rounded-xl bg-secondary border border-border text-center"
              />
            ) : (
              <p className="text-lg font-semibold">
                {user?.name || "User"}
              </p>
            )}

            <p className="text-muted-foreground text-sm">
              {user?.email}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="space-y-3 pt-4">

            {isEditing ? (
              <button
                onClick={handleSave}
                className="w-full bg-primary text-white py-2 rounded-xl"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-secondary border border-border py-2 rounded-xl hover:bg-muted transition"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="w-full bg-destructive text-white py-2 rounded-xl hover:opacity-90 transition"
            >
              Logout
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;