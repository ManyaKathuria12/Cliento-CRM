import { useState, useRef } from "react";
import { Camera, User, Mail, Phone, Briefcase, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { authFetch, API_BASE_URL } from "@/utils/api";

interface ProfileTabProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function ProfileTab({ user, onUpdate }: ProfileTabProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file ❌");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB ❌");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const loadingToast = toast.loading("Uploading picture...");
    try {
      const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { file: filename } = await uploadRes.json();

      setAvatar(filename);
      toast.dismiss(loadingToast);
      toast.success("Image uploaded! Click 'Save Changes' to apply.");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload avatar ❌");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required ❌");
    if (!email.trim()) return toast.error("Email is required ❌");

    setIsLoading(true);
    const loadingToast = toast.loading("Saving changes...");

    try {
      const res = await authFetch(`/auth/profile/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          jobTitle,
          bio,
          avatar,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      onUpdate(data);
      toast.dismiss(loadingToast);
      toast.success("Profile updated successfully! ✅");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to update profile ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || "U";

  return (
    <form onSubmit={handleSave} className="glass rounded-2xl p-6 border border-border/50 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Profile Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your public profile information</p>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-2 border-b border-border/30">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => fileInputRef.current?.click()}
          title="Click to upload profile picture"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            className="hidden"
            accept="image/*"
          />
          {avatar ? (
            <img
              src={avatar.startsWith("http") ? avatar : `${API_BASE_URL}/uploads/${avatar}`}
              className="w-24 h-24 rounded-full object-cover border-2 border-primary group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center text-black font-extrabold text-3xl group-hover:opacity-75 transition-opacity">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:opacity-90 border border-background">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <p className="text-sm font-semibold text-foreground">Profile Picture</p>
          <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 5MB.</p>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="text-xs text-primary font-semibold hover:underline"
          >
            Change photo
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <User size={12} /> FULL NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Mail size={12} /> EMAIL ADDRESS
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="johndoe@cliento.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Phone size={12} /> PHONE NUMBER
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Briefcase size={12} /> JOB TITLE
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="Sales Representative"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <FileText size={12} /> BIO
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
