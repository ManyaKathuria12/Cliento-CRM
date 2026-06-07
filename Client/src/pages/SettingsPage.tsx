import { User, Bell, Shield, Palette } from "lucide-react";

const SettingsPage = () => (
  <div className="space-y-6 max-w-2xl">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
    </div>

    {/* Profile */}
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><User size={16} className="text-primary" /> Profile</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Full Name</label>
          <input defaultValue="Rahul Sharma" className="mt-1 w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Email</label>
          <input defaultValue="rahul@cliento.in" className="mt-1 w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Phone</label>
          <input defaultValue="+91 98765 43210" className="mt-1 w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Company</label>
          <input defaultValue="Cliento Technologies" className="mt-1 w-full bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
        </div>
      </div>
    </div>

    {/* Notifications */}
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><Bell size={16} className="text-primary" /> Notifications</h3>
      <div className="space-y-3">
        {["Email notifications", "Push notifications", "Deal updates", "New lead alerts"].map((item) => (
          <label key={item} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">{item}</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
          </label>
        ))}
      </div>
    </div>

    {/* Security */}
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4"><Shield size={16} className="text-primary" /> Security</h3>
      <button className="text-sm bg-secondary text-foreground px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors">
        Change Password
      </button>
    </div>

    <button className="bg-gradient-to-r from-primary to-cyan text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition-opacity text-sm">
      Save Changes
    </button>
  </div>
);

export default SettingsPage;
