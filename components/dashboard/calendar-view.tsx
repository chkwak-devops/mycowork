"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { CalendarIssue } from "@/app/api/jira/calendar/route";

const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildCalendarGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const startDayOfWeek = firstDay.getDay();
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= lastDate; day++) {
    currentWeek.push(new Date(year, month - 1, day));
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
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

interface CalendarViewProps {
  issues: CalendarIssue[];
  loading: boolean;
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarView({
  issues,
  loading,
  year,
  month,
  onPrevMonth,
  onNextMonth,
}: CalendarViewProps) {
  const today = new Date();
  const todayKey = getDateKey(today);
  const weeks = buildCalendarGrid(year, month);

  const issuesByDate = new Map<string, CalendarIssue[]>();
  for (const issue of issues) {
    const existing = issuesByDate.get(issue.calendarDate) ?? [];
    existing.push(issue);
    issuesByDate.set(issue.calendarDate, existing);
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
        <button
          onClick={onPrevMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">
            {year}년 {month}월
          </h2>
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        </div>
        <button
          onClick={onNextMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 border-b border-border/30">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={`px-2 py-2 text-[11px] font-medium text-muted-foreground/60 text-center uppercase tracking-wider ${
              i === 0 || i === 6 ? "text-red-400/60" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="divide-y divide-border/20">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 divide-x divide-border/20">
            {week.map((date, di) => {
              if (!date) {
                return <div key={`e-${wi}-${di}`} className="min-h-[100px] bg-muted/20" />;
              }

              const key = getDateKey(date);
              const dayIssues = issuesByDate.get(key) ?? [];
              const isToday = key === todayKey;
              const isWeekend = di === 0 || di === 6;
              const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

              return (
                <div
                  key={key}
                  className={`min-h-[100px] p-1.5 transition-colors ${
                    isToday
                      ? "bg-primary/5"
                      : isPast
                        ? "bg-muted/10"
                        : "hover:bg-muted/20"
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`text-xs font-medium leading-none tabular-nums inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday
                          ? "bg-primary text-primary-foreground text-[11px]"
                          : isWeekend
                            ? "text-red-400/70"
                            : "text-muted-foreground/70"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayIssues.slice(0, 3).map((issue) => (
                      <a
                        key={issue.id}
                        href={`${JIRA_BASE_URL}/browse/${issue.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/cell flex items-center gap-1 rounded px-1 py-0.5 hover:bg-muted/60 transition-colors cursor-pointer"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityDot(issue.fields.priority?.name)}`} />
                        <span className="text-[11px] leading-tight truncate text-muted-foreground/90 group-hover/cell:text-foreground transition-colors">
                          {issue.fields.summary}
                        </span>
                      </a>
                    ))}
                    {dayIssues.length > 3 && (
                      <div className="flex items-center gap-1 px-1">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-[10px] text-muted-foreground/50 ml-0.5">
                          +{dayIssues.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
