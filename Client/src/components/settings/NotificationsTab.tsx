import { useState } from "react";
import { Bell, Users, Handshake, Clock, Mail, Monitor } from "lucide-react";
import toast from "react-hot-toast";
import { authFetch } from "@/utils/api";

interface NotificationsTabProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function NotificationsTab({ user, onUpdate }: NotificationsTabProps) {
  const [leadNotifications, setLeadNotifications] = useState(user?.leadNotifications !== false);
  const [dealNotifications, setDealNotifications] = useState(user?.dealNotifications !== false);
  const [taskReminders, setTaskReminders] = useState(user?.taskReminders !== false);
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications !== false);
  const [browserNotifications, setBrowserNotifications] = useState(user?.browserNotifications !== false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Saving preferences...");

    try {
      const res = await authFetch(`/auth/profile/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadNotifications,
          dealNotifications,
          taskReminders,
          emailNotifications,
          browserNotifications,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update notification preferences");

      onUpdate(data);
      toast.dismiss(loadingToast);
      toast.success("Notification preferences saved! ✅");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to save preferences ❌");
    } finally {
      setIsLoading(false);
    }
  };

  const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-all relative cursor-pointer shrink-0 ${
        checked ? "bg-primary" : "bg-[#1f2f35] border border-border/50"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
          checked ? "left-6 bg-primary-foreground" : "left-1"
        }`}
      />
    </button>
  );

  return (
    <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Bell size={20} className="text-primary" /> Notification Preferences
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Choose how and when you want to receive alerts</p>
      </div>

      <div className="space-y-4">
        {/* Lead Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/20 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Users size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Lead Alerts</p>
              <p className="text-xs text-muted-foreground">Notify when a new lead is assigned to you or updated.</p>
            </div>
          </div>
          <Switch checked={leadNotifications} onChange={() => setLeadNotifications(!leadNotifications)} />
        </div>

        {/* Deal Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/20 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Handshake size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Deal Alerts</p>
              <p className="text-xs text-muted-foreground">Notify when deals change stages, are won, or are lost.</p>
            </div>
          </div>
          <Switch checked={dealNotifications} onChange={() => setDealNotifications(!dealNotifications)} />
        </div>

        {/* Task Reminders */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/20 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Clock size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Task Reminders</p>
              <p className="text-xs text-muted-foreground">Receive reminders for pending, in progress, or overdue tasks.</p>
            </div>
          </div>
          <Switch checked={taskReminders} onChange={() => setTaskReminders(!taskReminders)} />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/20 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Mail size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Email Channels</p>
              <p className="text-xs text-muted-foreground">Receive summary emails and daily digests in your inbox.</p>
            </div>
          </div>
          <Switch checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
        </div>

        {/* Browser Notifications */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/20 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Monitor size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Browser Push Banners</p>
              <p className="text-xs text-muted-foreground">Receive desktop banners when you have the app open.</p>
            </div>
          </div>
          <Switch checked={browserNotifications} onChange={() => setBrowserNotifications(!browserNotifications)} />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-cyan text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
