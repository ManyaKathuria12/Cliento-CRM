import { useState, useRef } from "react";
import { Camera, Building, Globe, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { authFetch } from "@/utils/api";

interface CompanyTabProps {
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function CompanyTab({ user, onUpdate }: CompanyTabProps) {
  const [companyName, setCompanyName] = useState(user?.company || "");
  const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite || "");
  const [companyIndustry, setCompanyIndustry] = useState(user?.companyIndustry || "");
  const [companyLogo, setCompanyLogo] = useState(user?.companyLogo || "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const loadingToast = toast.loading("Uploading logo...");
    try {
      const uploadRes = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { file: filename } = await uploadRes.json();

      setCompanyLogo(filename);
      toast.dismiss(loadingToast);
      toast.success("Logo uploaded! Click 'Save Changes' to apply.");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error("Failed to upload logo ❌");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic URL validation if website is provided
    if (companyWebsite.trim() && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(companyWebsite.trim())) {
      return toast.error("Please enter a valid website URL (starting with http:// or https://) ❌");
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Saving company settings...");

    try {
      const res = await authFetch(`/auth/profile/${user?._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: companyName,
          companyWebsite,
          companyIndustry,
          companyLogo,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update company settings");

      onUpdate(data);
      toast.dismiss(loadingToast);
      toast.success("Company settings updated successfully! ✅");
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error(err.message || "Failed to update company settings ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="glass rounded-2xl p-6 border border-border/50 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Company Information</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your organization details and branding</p>
      </div>

      {/* Company Logo Upload */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-2 border-b border-border/30">
        <div 
          className="relative group cursor-pointer" 
          onClick={() => fileInputRef.current?.click()}
          title="Click to change logo"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleLogoUpload}
            className="hidden"
            accept="image/*"
          />
          {companyLogo ? (
            <img
              src={`http://localhost:5000/uploads/${companyLogo}`}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-primary group-hover:opacity-75 transition-opacity"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:opacity-75 transition-opacity">
              <Building size={32} />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={24} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-xl cursor-pointer hover:opacity-90 border border-background">
            <Camera size={14} />
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <p className="text-sm font-semibold text-foreground">Company Logo</p>
          <p className="text-xs text-muted-foreground">Square icon recommended. Max size 5MB.</p>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="text-xs text-primary font-semibold hover:underline"
          >
            Upload new logo
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Building size={12} /> COMPANY NAME
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="Cliento Technologies"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Globe size={12} /> WEBSITE URL
          </label>
          <input
            type="text"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Layers size={12} /> INDUSTRY
          </label>
          <input
            type="text"
            value={companyIndustry}
            onChange={(e) => setCompanyIndustry(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm focus:outline-none focus:border-primary"
            placeholder="Software, Finance, Healthcare, Real Estate..."
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
