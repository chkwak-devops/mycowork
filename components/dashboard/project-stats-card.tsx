import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectStat {
  key: string;
  name: string;
  total: number;
  done: number;
  inProgress: number;
  todo: number;
}

export function ProjectStatsCard({ stats }: { stats: ProjectStat[] }) {
  return (
    <Card>
      <CardHeader className="border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary/40" />
          <CardTitle className="text-sm font-medium">프로젝트별 이슈 현황</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {stats.length === 0 && (
          <p className="text-sm text-muted-foreground/50 text-center py-8 italic">데이터가 없습니다</p>
        )}
        {stats.map((s) => {
          const donePercent = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
          return (
            <div key={s.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-primary/30 shrink-0" />
                  <span className="text-sm font-medium truncate">{s.name}</span>
                  <span className="text-xs text-muted-foreground/50 font-mono shrink-0">{s.key}</span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground/60 shrink-0 ml-2">{s.done}/{s.total}</span>
              </div>
              <Progress value={donePercent} className="h-1.5 bg-muted/60" />
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500/70" />{s.todo}<span className="text-muted-foreground/50 ml-0.5">대기</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500/70" />{s.inProgress}<span className="text-muted-foreground/50 ml-0.5">진행</span></span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500/70" />{s.done}<span className="text-muted-foreground/50 ml-0.5">완료</span></span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
