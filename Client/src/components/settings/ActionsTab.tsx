import { useState } from "react";
import { LogOut, Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { authFetch } from "@/utils/api";

interface ActionsTabProps {
  user: any;
  logout: () => void;
}

export default function ActionsTab({ user, logout }: ActionsTabProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleLogoutAll = async () => {
    if (!window.confirm("Are you sure you want to log out from all devices? You will be signed out immediately from this device too.")) return;

    setIsLoggingOutAll(true);
    const loadingToast = toast.loading("Logging out from all sessions...");

    try {
      const res = await authFetch(`/auth/logout-all/${user?._id}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Logout all failed");

      toast.dismiss(loadingToast);
      toast.success("Successfully logged out from all devices!");
      logout();
      navigate("/login");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to invalidate sessions ❌");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmName !== user?.name) {
      return toast.error("Name matching is incorrect ❌");
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting your account permanently...");

    try {
      const res = await authFetch(`/auth/delete-account/${user?._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete account");

      toast.dismiss(loadingToast);
      toast.success("Your account has been permanently deleted.");
      setShowDeleteModal(false);
      logout();
      navigate("/login");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to delete account ❌");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Account Actions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Sensitive configurations and destructive operations</p>
      </div>

      <div className="space-y-4">
        {/* Logout All Devices */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/10 border border-border/20 gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <LogOut size={16} /> Logout from All Devices
            </p>
            <p className="text-xs text-muted-foreground">Force-logout other active sessions by resetting token access tokens.</p>
          </div>
          <button
            type="button"
            disabled={isLoggingOutAll}
            onClick={handleLogoutAll}
            className="px-4 py-2 bg-secondary border border-border rounded-xl text-xs font-semibold hover:bg-muted text-foreground transition-all shrink-0 cursor-pointer"
          >
            Logout All Devices
          </button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20 gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
              <Trash2 size={16} /> Delete CRM Account
            </p>
            <p className="text-xs text-muted-foreground/80">Permanently delete your profile data. This cannot be undone.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-destructive/10 border border-destructive/25 text-destructive rounded-xl text-xs font-semibold hover:bg-destructive/20 transition-all shrink-0 cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
          <div className="glass-strong border border-destructive/30 p-6 rounded-2xl w-full max-w-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center text-destructive shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Account Deletion</h3>
                <p className="text-xs text-muted-foreground">This operation is permanent and irreversible.</p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>You are about to permanently delete your Cliento CRM account. All leads, tasks, settings and details linked directly to your profile credentials will be removed.</p>
              <p className="font-semibold text-destructive">To verify, please enter your full name below (<span className="underline">{user?.name}</span>):</p>
            </div>

            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-destructive"
              placeholder={user?.name}
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => { setShowDeleteModal(false); setConfirmName(""); }}
                className="w-1/2 border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || confirmName !== user?.name}
                onClick={handleDeleteAccount}
                className="w-1/2 bg-destructive text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
