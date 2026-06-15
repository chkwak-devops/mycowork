"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { StatCard } from "./stat-card";
import { IssueListCard } from "./issue-list-card";
import { ProjectStatsCard } from "./project-stats-card";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { CheckCircle, FileText, Clock, Activity, AlertTriangleIcon } from "lucide-react";
import { PriorityChart } from "./priority-chart";
import { CreateConfluencePageModal } from "@/components/confluence/create-page-modal";
import type { JiraIssue, JiraUser } from "@/lib/jira";
import { CalendarView } from "./calendar-view";
import type { CalendarIssue } from "@/app/api/jira/calendar/route";
import { RecentConfluencePages } from "./recent-confluence-pages";
import type { ConfluenceRecentPage } from "@/lib/confluence";

interface DashboardData {
  user: JiraUser;
  myOpenIssues: JiraIssue[];
  myOpenTotal: number;
  myReportedIssues: JiraIssue[];
  myReportedTotal: number;
  dueSoonIssues: JiraIssue[];
  recentActivityIssues: JiraIssue[];
  staleIssues: JiraIssue[];
  priorityDistribution: PriorityItem[];
  projectStats: Array<{ key: string; name: string; total: number; done: number; inProgress: number; todo: number }>;
}

interface PriorityItem {
  name: string;
  value: number;
  color: string;
}

const JIRA_BASE_URL = process.env.NEXT_PUBLIC_JIRA_BASE_URL ?? "";

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);
  const [calendarIssues, setCalendarIssues] = useState<CalendarIssue[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [confluencePages, setConfluencePages] = useState<ConfluenceRecentPage[]>([]);
  const [confluenceLoading, setConfluenceLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jira/dashboard");
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const json: DashboardData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfluencePages = useCallback(async () => {
    setConfluenceLoading(true);
    try {
      const res = await fetch("/api/confluence/my-pages");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setConfluencePages(json.pages ?? []);
    } catch (e) {
      console.error("Failed to fetch confluence pages:", e);
      setConfluencePages([]);
    } finally {
      setConfluenceLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfluencePages();
  }, [fetchConfluencePages]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const fetchCalendar = useCallback(async (year: number, month: number) => {
    setCalendarLoading(true);
    try {
      const res = await fetch(`/api/jira/calendar?year=${year}&month=${month}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setCalendarIssues(json.issues ?? []);
    } catch (e) {
      console.error("Failed to fetch calendar data:", e);
      setCalendarIssues([]);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendar(calendarYear, calendarMonth);
  }, [calendarYear, calendarMonth, fetchCalendar]);

  const handlePrevMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 1) {
        setCalendarYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarMonth((prev) => {
      if (prev === 12) {
        setCalendarYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
  }, []);

  const overdueCount = data?.dueSoonIssues.filter(
    (i) => i.fields.duedate && new Date(i.fields.duedate) < new Date()
  ).length ?? 0;

  function formatStaleMax(issues: JiraIssue[]): number {
    const oldest = issues.reduce((max, i) => {
      const days = Math.floor((Date.now() - new Date(i.fields.updated).getTime()) / 86400000);
      return Math.max(max, days);
    }, 0);
    return oldest;
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60 sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data?.user && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={data.user.avatarUrls["48x48"]} alt={data.user.displayName} />
                <AvatarFallback>{data.user.displayName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-base font-semibold leading-none tracking-tight">
                {data?.user ? `${data.user.displayName}의 Jira 대시보드` : "Jira 대시보드"}
              </h1>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  {lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 업데이트
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreateConfluencePageModal />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={loading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-medium">Jira 연결 오류</p>
              <p className="text-xs mt-0.5">{error}</p>
              <p className="text-xs mt-1 text-red-600 dark:text-red-400">
                .env.local 의 JIRA_BASE_URL 및 JIRA_PAT 값을 확인해주세요.
              </p>
            </div>
          </div>
        )}

        {loading && !data ? (
          <DashboardSkeleton />
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard
                title="내 미완료 이슈"
                value={data.myOpenTotal}
                sub="담당자로 할당된 이슈"
                icon={CheckCircle}
                iconColor="text-blue-500"
              />
              <StatCard
                title="내가 보고한 이슈"
                value={data.myReportedTotal}
                sub="최근 30일"
                icon={FileText}
                iconColor="text-purple-500"
              />
              <StatCard
                title="마감 임박"
                value={data.dueSoonIssues.length}
                sub={overdueCount > 0 ? `${overdueCount}개 기한 초과` : "이번 주 마감"}
                icon={Clock}
                iconColor={overdueCount > 0 ? "text-red-500" : "text-orange-500"}
              />
              <StatCard
                title="최근 활동"
                value={data.recentActivityIssues.length}
                sub="최근 7일 업데이트"
                icon={Activity}
                iconColor="text-green-500"
              />
              <StatCard
                title="방치 이슈"
                value={data.staleIssues.length}
                sub={data.staleIssues.length > 0 ? `최장 ${formatStaleMax(data.staleIssues)}일` : "모든 이슈가 관리 중"}
                icon={AlertTriangleIcon}
                iconColor={data.staleIssues.length > 5 ? "text-red-500" : data.staleIssues.length > 0 ? "text-amber-500" : "text-green-500"}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/40" />
                <h3 className="text-sm font-medium text-muted-foreground">월별 캘린더</h3>
              </div>
              <CalendarView
                issues={calendarIssues}
                loading={calendarLoading}
                year={calendarYear}
                month={calendarMonth}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <IssueListCard
                title="내 미완료 이슈"
                issues={data.myOpenIssues.slice(0, 10)}
                total={data.myOpenTotal}
                jiraBaseUrl={JIRA_BASE_URL}
                showUpdated
              />
              <IssueListCard
                title="마감 임박 이슈"
                issues={data.dueSoonIssues}
                jiraBaseUrl={JIRA_BASE_URL}
                showDueDate
                emptyMessage="마감 임박 이슈가 없습니다 🎉"
              />
              <IssueListCard
                title="내가 보고한 이슈"
                issues={data.myReportedIssues.slice(0, 10)}
                total={data.myReportedTotal}
                jiraBaseUrl={JIRA_BASE_URL}
                showUpdated
              />
              <RecentConfluencePages
                pages={confluencePages}
                loading={confluenceLoading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <IssueListCard
                title="방치 이슈"
                issues={data.staleIssues.slice(0, 15)}
                jiraBaseUrl={JIRA_BASE_URL}
                showUpdated
                emptyMessage="방치된 이슈가 없습니다 ✨"
              />
              <PriorityChart data={data.priorityDistribution} />
            </div>

            <ProjectStatsCard stats={data.projectStats} />
          </>
        ) : null}
      </main>
    </div>
  );
}
