import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/utils/api";
import { User, Building, Shield, Bell, Palette, AlertTriangle } from "lucide-react";
import ProfileTab from "@/components/settings/ProfileTab";
import CompanyTab from "@/components/settings/CompanyTab";
import SecurityTab from "@/components/settings/SecurityTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import AppearanceTab from "@/components/settings/AppearanceTab";
import ActionsTab from "@/components/settings/ActionsTab";

type TabId = "profile" | "company" | "security" | "notifications" | "appearance" | "actions";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab")?.toLowerCase();
  const paramToTab = (param: string | null): TabId => {
    switch (param) {
      case "company":
        return "company";
      case "security":
        return "security";
      case "notifications":
        return "notifications";
      case "theme":
        return "appearance";
      case "appearance":
        return "appearance";
      case "account":
        return "actions";
      case "actions":
        return "actions";
      case "profile":
      default:
        return "profile";
    }
  };
  const [activeTab, setActiveTab] = useState<TabId>(() => paramToTab(tabParam));
  const [dbUser, setDbUser] = useState<any>(user);
  const [isLoading, setIsLoading] = useState(true);

  // Sync settings immediately back to global AuthContext
  const handleUpdate = (updatedUser: any) => {
    setDbUser(updatedUser);
    const contextUser = {
      ...user,
      ...updatedUser,
    };
    setUser(contextUser);
    localStorage.setItem("user", JSON.stringify(contextUser));
  };

  useEffect(() => {
    setActiveTab(paramToTab(tabParam));
  }, [tabParam]);

  useEffect(() => {
    if (!user?._id) return;
    setIsLoading(true);

    authFetch(`/auth/profile/${user._id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch settings data");
        return res.json();
      })
      .then((data) => {
        setDbUser(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading fresh settings:", err);
        setIsLoading(false);
      });
  }, [user?._id]);

  if (isLoading || !dbUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">Loading settings preferences...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "company", label: "Company Info", icon: Building },
    { id: "security", label: "Security & Passwords", icon: Shield },
    { id: "notifications", label: "Notification Channels", icon: Bell },
    { id: "appearance", label: "Theme & Styling", icon: Palette },
    { id: "actions", label: "Account Actions", icon: AlertTriangle },
  ] as const;

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    const tabValue = tabId === "appearance" ? "theme" : tabId === "actions" ? "account" : tabId;
    setSearchParams({ tab: tabValue });
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4 md:px-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your account, notifications, and CRM settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 flex overflow-x-auto md:flex-col gap-1.5 p-1 rounded-2xl glass border border-border/40 no-scrollbar md:p-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Tab Content Area */}
        <div className="flex-1 w-full animate-in fade-in duration-200">
          {activeTab === "profile" && <ProfileTab user={dbUser} onUpdate={handleUpdate} />}
          {activeTab === "company" && <CompanyTab user={dbUser} onUpdate={handleUpdate} />}
          {activeTab === "security" && <SecurityTab user={dbUser} />}
          {activeTab === "notifications" && <NotificationsTab user={dbUser} onUpdate={handleUpdate} />}
          {activeTab === "appearance" && <AppearanceTab user={dbUser} onUpdate={handleUpdate} />}
          {activeTab === "actions" && <ActionsTab user={dbUser} logout={logout} />}
        </div>
      </div>
    </div>
  );
}
