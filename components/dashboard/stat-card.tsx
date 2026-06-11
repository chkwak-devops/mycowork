import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  iconColor?: string;
  accentColor?: string;
}

export function StatCard({ title, value, sub, icon: Icon, iconColor = "text-muted-foreground", accentColor = "bg-primary/10" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] group">
      <div className={`absolute inset-y-0 left-0 w-0.5 ${accentColor.replace("text-", "bg-").replace("text", "bg")}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 transition-colors duration-150 ${iconColor} group-hover:scale-110`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight tabular-nums">{value.toLocaleString()}</div>
        {sub && <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed">{sub}</p>}
      </CardContent>
    </Card>
  );
}
