import { useState } from "react";
import { Palette, Check } from "lucide-react";
import toast from "react-hot-toast";
import { authFetch } from "@/utils/api";

interface AppearanceTabProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function AppearanceTab({ user, onUpdate }: AppearanceTabProps) {
  const [theme, setTheme] = useState(user?.theme || "dark");
  const [isLoading, setIsLoading] = useState(false);

  const applyTheme = (selectedTheme: string) => {
    if (selectedTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    applyTheme(newTheme);

    setIsLoading(true);
    try {
      const res = await authFetch(`/auth/profile/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: newTheme,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update theme");

      onUpdate(data);
      toast.success(`${newTheme === "light" ? "Light" : "Dark"} mode applied! ✅`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save theme setting ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Palette size={20} className="text-primary" /> Appearance
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customize Cliento theme interface</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Dark Theme Card */}
        <div 
          onClick={() => handleThemeChange("dark")}
          className={`relative border rounded-2xl p-4 cursor-pointer overflow-hidden transition-all duration-300 select-none ${
            theme === "dark" 
              ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
              : "border-border bg-secondary/10 hover:border-muted-foreground/30"
          }`}
        >
          {/* Mockup Preview */}
          <div className="w-full h-32 rounded-xl bg-[#030a0d] border border-border/50 p-2 space-y-2 relative">
            {/* Sidebar Mock */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#020608] border-r border-border/30 p-1 space-y-1">
              <div className="w-full h-1 bg-primary/40 rounded-full" />
              <div className="w-full h-1 bg-muted-foreground/20 rounded-full" />
              <div className="w-full h-1 bg-muted-foreground/20 rounded-full" />
            </div>
            {/* Main Area Mock */}
            <div className="pl-9 pr-1 pt-1 space-y-2">
              <div className="h-2 w-12 bg-muted-foreground/30 rounded-full" />
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-8 bg-[#091519] border border-border/40 rounded p-1 space-y-1">
                  <div className="h-1 w-4 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-6 bg-primary rounded-full" />
                </div>
                <div className="h-8 bg-[#091519] border border-border/40 rounded p-1 space-y-1">
                  <div className="h-1 w-4 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-6 bg-[#0f766e] rounded-full" />
                </div>
                <div className="h-8 bg-[#091519] border border-border/40 rounded p-1 space-y-1">
                  <div className="h-1 w-4 bg-muted-foreground/20 rounded-full" />
                  <div className="h-2 w-6 bg-[#0e7490] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Dark Theme</p>
              <p className="text-xs text-muted-foreground">Default dark slate profile color</p>
            </div>
            {theme === "dark" && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>

        {/* Light Theme Card */}
        <div 
          onClick={() => handleThemeChange("light")}
          className={`relative border rounded-2xl p-4 cursor-pointer overflow-hidden transition-all duration-300 select-none ${
            theme === "light" 
              ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(20,184,166,0.1)]" 
              : "border-border bg-secondary/10 hover:border-muted-foreground/30"
          }`}
        >
          {/* Mockup Preview */}
          <div className="w-full h-32 rounded-xl bg-[#f4f6f7] border border-border/50 p-2 space-y-2 relative">
            {/* Sidebar Mock */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-[#e9eced] border-r border-border/30 p-1 space-y-1">
              <div className="w-full h-1 bg-primary/40 rounded-full" />
              <div className="w-full h-1 bg-muted-foreground/40 rounded-full" />
              <div className="w-full h-1 bg-muted-foreground/40 rounded-full" />
            </div>
            {/* Main Area Mock */}
            <div className="pl-9 pr-1 pt-1 space-y-2">
              <div className="h-2 w-12 bg-muted-foreground/40 rounded-full" />
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-8 bg-white border border-border/50 rounded p-1 space-y-1">
                  <div className="h-1 w-4 bg-muted-foreground/30 rounded-full" />
                  <div className="h-2 w-6 bg-primary rounded-full" />
                </div>
                <div className="h-8 bg-white border border-border/50 rounded p-1 space-y-1">
                  <div className="h-1 w-4 bg-muted-foreground/30 rounded-full" />
                  <div className="h-2 w-6 bg-[#0f766e] rounded-full" />
                </div>
                <div className="h-8 bg-white border border-border/50 rounded p-1 space-y-1">
                  <div className="h-1 w-4 bg-muted-foreground/30 rounded-full" />
                  <div className="h-2 w-6 bg-[#0e7490] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Light Theme</p>
              <p className="text-xs text-muted-foreground">High contrast clean light display</p>
            </div>
            {theme === "light" && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
