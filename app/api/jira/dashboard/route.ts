function computePriorityDistribution(issues: Array<{ fields: { priority?: { name: string } } }>): Array<{ name: string; value: number; color: string }> {
  const counts: Record<string, number> = {};
  for (const issue of issues) {
    const name = issue.fields.priority?.name ?? "Unknown";
    counts[name] = (counts[name] ?? 0) + 1;
  }
  const colorMap: Record<string, string> = {
    "Blocker": "#ef4444", "Critical": "#ef4444",
    "Major": "#f97316", "High": "#f97316",
    "Medium": "#eab308",
    "Minor": "#3b82f6", "Low": "#3b82f6",
    "Trivial": "#9ca3af",
  };
  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name] ?? "#6b7280",
  }));
}

import { NextResponse } from "next/server";
import { jiraSearch, jiraGetMyself } from "@/lib/jira";

export async function GET() {
  try {
    const user = await jiraGetMyself();
    const username = user.name ?? user.emailAddress;

    const [myOpenIssues, myReportedIssues, dueSoonIssues, recentActivityIssues, staleIssues] = await Promise.all([
      jiraSearch(
        `assignee = "${username}" AND resolution = Unresolved ORDER BY updated DESC`,
        undefined,
        50
      ),
      jiraSearch(
        `reporter = "${username}" AND created >= -30d ORDER BY created DESC`,
        undefined,
        30
      ),
      jiraSearch(
        `assignee = "${username}" AND duedate <= "1w" AND resolution = Unresolved ORDER BY duedate ASC`,
        undefined,
        20
      ),
      jiraSearch(
        `assignee = "${username}" AND updated >= -7d ORDER BY updated DESC`,
        undefined,
        20
      ),
      jiraSearch(
        `assignee = "${username}" AND resolution = Unresolved AND updated <= -7d ORDER BY updated ASC`,
        undefined,
        30
      ),
    ]);

    const projectStats: Record<string, { name: string; total: number; done: number; inProgress: number; todo: number }> = {};
    for (const issue of myOpenIssues.issues) {
      const { key, name } = issue.fields.project;
      if (!projectStats[key]) {
        projectStats[key] = { name, total: 0, done: 0, inProgress: 0, todo: 0 };
      }
      const cat = issue.fields.status.statusCategory.key;
      projectStats[key].total++;
      if (cat === "done") projectStats[key].done++;
      else if (cat === "indeterminate") projectStats[key].inProgress++;
      else projectStats[key].todo++;
    }

    return NextResponse.json({
      user,
      myOpenIssues: myOpenIssues.issues,
      myOpenTotal: myOpenIssues.total,
      myReportedIssues: myReportedIssues.issues,
      myReportedTotal: myReportedIssues.total,
      dueSoonIssues: dueSoonIssues.issues,
      recentActivityIssues: recentActivityIssues.issues,
      projectStats: Object.entries(projectStats).map(([key, val]) => ({ key, ...val })),
      staleIssues: staleIssues.issues,
      priorityDistribution: computePriorityDistribution(myOpenIssues.issues),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
