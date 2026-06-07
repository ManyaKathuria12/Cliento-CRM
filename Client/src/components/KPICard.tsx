import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: LucideIcon;
}

const KPICard = ({ title, value, change, changeType, icon: Icon }: KPICardProps) => (
  <div className="glass rounded-2xl p-5 hover-lift gradient-border">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
        <p className={`text-xs mt-2 ${changeType === "up" ? "text-primary" : "text-destructive"}`}>
          {changeType === "up" ? "↑" : "↓"} {change} from last month
        </p>
      </div>
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon size={20} className="text-primary" />
      </div>
    </div>
  </div>
);

export default KPICard;
