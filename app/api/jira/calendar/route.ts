import { NextRequest, NextResponse } from "next/server";
import { jiraSearch, jiraGetMyself } from "@/lib/jira";
import type { JiraIssue } from "@/lib/jira";

export interface CalendarIssue extends JiraIssue {
  calendarDate: string;
  dateType: "duedate" | "created" | "resolutiondate";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
    const month = parseInt(searchParams.get("month") ?? String(new Date().getMonth() + 1));

    if (month < 1 || month > 12) {
      return NextResponse.json({ error: "month must be 1-12" }, { status: 400 });
    }

    const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const user = await jiraGetMyself();
    const username = user.name ?? user.emailAddress;

    const [createdIssues, dueIssues, resolvedIssues] = await Promise.all([
      jiraSearch(
        `assignee = "${username}" AND created >= "${startOfMonth}" AND created <= "${endOfMonth}" ORDER BY created ASC`,
        undefined,
        300
      ),
      jiraSearch(
        `assignee = "${username}" AND duedate >= "${startOfMonth}" AND duedate <= "${endOfMonth}" ORDER BY duedate ASC`,
        undefined,
        300
      ),
      jiraSearch(
        `assignee = "${username}" AND resolutiondate >= "${startOfMonth}" AND resolutiondate <= "${endOfMonth}" ORDER BY resolutiondate ASC`,
        undefined,
        300
      ),
    ]);

    const seen = new Set<string>();
    const calendarIssues: CalendarIssue[] = [];

    for (const issue of dueIssues.issues) {
      if (issue.fields.duedate && !seen.has(issue.id)) {
        seen.add(issue.id);
        calendarIssues.push({
          ...issue,
          calendarDate: issue.fields.duedate,
          dateType: "duedate",
        });
      }
    }

    for (const issue of createdIssues.issues) {
      if (!seen.has(issue.id)) {
        seen.add(issue.id);
        calendarIssues.push({
          ...issue,
          calendarDate: issue.fields.created.slice(0, 10),
          dateType: "created",
        });
      }
    }

    for (const issue of resolvedIssues.issues) {
      if (issue.fields.resolutiondate && !seen.has(issue.id)) {
        seen.add(issue.id);
        calendarIssues.push({
          ...issue,
          calendarDate: issue.fields.resolutiondate.slice(0, 10),
          dateType: "resolutiondate",
        });
      }
    }

    calendarIssues.sort((a, b) => a.calendarDate.localeCompare(b.calendarDate));

    return NextResponse.json({
      user,
      issues: calendarIssues,
      year,
      month,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
