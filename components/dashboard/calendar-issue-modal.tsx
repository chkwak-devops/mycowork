import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CalendarIssue } from "@/app/api/jira/calendar/route";

interface CalendarIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateKey: string;
  issues: CalendarIssue[];
  jiraBaseUrl: string;
}

function getPriorityDot(priorityName?: string): string {
  const map: Record<string, string> = {
    Blocker: "bg-red-500",
    Critical: "bg-red-500",
    Major: "bg-orange-500",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Minor: "bg-blue-500",
    Low: "bg-blue-500",
    Trivial: "bg-gray-400",
  };
  return map[priorityName ?? ""] ?? "bg-gray-400";
}

export function CalendarIssueModal({ isOpen, onClose, dateKey, issues, jiraBaseUrl }: CalendarIssueModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{dateKey} 일정 ({issues.length}건)</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-4">
          {issues.map((issue) => (
            <a
              key={issue.id}
              href={`${jiraBaseUrl}/browse/${issue.key}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col p-3 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">{issue.key}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    issue.dateType === "duedate"
                      ? "bg-red-500/10 text-red-600 border-red-500/20"
                      : issue.dateType === "created"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  }`}
                >
                  {issue.dateType === "duedate" ? "마감" : issue.dateType === "created" ? "생성" : "해결"}
                </span>
                {issue.fields.priority && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                    <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(issue.fields.priority.name)}`} />
                    {issue.fields.priority.name}
                  </span>
                )}
              </div>
              <span className="text-sm line-clamp-2 leading-snug">{issue.fields.summary}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {issue.fields.status.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
