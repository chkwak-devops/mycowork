import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JiraIssue } from "@/lib/jira";
import { IssueRow } from "./issue-row";

interface IssueListCardProps {
  title: string;
  issues: JiraIssue[];
  total?: number;
  jiraBaseUrl: string;
  showDueDate?: boolean;
  showUpdated?: boolean;
  emptyMessage?: string;
}

export function IssueListCard({
  title,
  issues,
  total,
  jiraBaseUrl,
  showDueDate,
  showUpdated,
  emptyMessage = "이슈가 없습니다",
}: IssueListCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-2 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary/40" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          {total !== undefined && (
            <span className="text-xs tabular-nums text-muted-foreground/60">{total.toLocaleString()}개</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {issues.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 text-center py-10 italic">{emptyMessage}</p>
        ) : (
          <div>
            {issues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                jiraBaseUrl={jiraBaseUrl}
                showDueDate={showDueDate}
                showUpdated={showUpdated}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
