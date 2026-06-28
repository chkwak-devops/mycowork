import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { JiraIssue } from "@/lib/jira";

interface StatIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  issues: JiraIssue[];
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

export function StatIssueModal({ isOpen, onClose, title, issues, jiraBaseUrl }: StatIssueModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title} ({issues.length}건)</DialogTitle>
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
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {issue.fields.issuetype.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
