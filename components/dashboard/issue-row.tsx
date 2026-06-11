"use client";
import { Badge } from "@/components/ui/badge";
import { JiraIssue, formatDate, formatRelativeDate, getPriorityColor, getStatusColor } from "@/lib/jira";
import { AlertCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface IssueRowProps {
  issue: JiraIssue;
  jiraBaseUrl: string;
  showDueDate?: boolean;
  showUpdated?: boolean;
}

export function IssueRow({ issue, jiraBaseUrl, showDueDate, showUpdated }: IssueRowProps) {
  const { fields } = issue;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const isDueSoon = now !== null && fields.duedate && new Date(fields.duedate) <= new Date(now + 7 * 86400000);
  const isOverdue = now !== null && fields.duedate && new Date(fields.duedate) < new Date(now);

  return (
    <a
      href={`${jiraBaseUrl}/browse/${issue.key}`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors duration-150 border-b last:border-0 group before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-r before:bg-primary/0 before:transition-colors before:duration-150 hover:before:bg-primary/20"
    >
      <span className={`mt-0.5 shrink-0 text-xs font-medium transition-transform duration-150 group-hover:scale-125 ${getPriorityColor(fields.priority?.name ?? "")}`}>
        ●
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs text-muted-foreground font-mono shrink-0">{issue.key}</span>
          <Badge variant={getStatusColor(fields.status.statusCategory.key) as "secondary" | "default" | "outline"} className="text-[10px] py-px h-5 font-normal tracking-wide uppercase">
            {fields.status.name}
          </Badge>
          <span className="text-xs text-muted-foreground/60 shrink-0">{fields.issuetype.name}</span>
        </div>
        <p className="text-sm font-medium leading-snug group-hover:text-foreground transition-colors duration-150 truncate">{fields.summary}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/70">
          <span className="truncate max-w-[160px]">{fields.project.name}</span>
          {showDueDate && fields.duedate && (
            <span className={`flex items-center gap-1 shrink-0 ${isOverdue ? "text-red-500 font-medium" : isDueSoon ? "text-orange-500" : ""}`}>
              {(isOverdue || isDueSoon) && <AlertCircle className="w-3 h-3" />}
              {formatDate(fields.duedate)} 마감
            </span>
          )}
          {showUpdated && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {now !== null ? formatRelativeDate(fields.updated) : formatDate(fields.updated)}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
