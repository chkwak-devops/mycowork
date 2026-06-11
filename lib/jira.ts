

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status: {
      name: string;
      statusCategory: {
        key: string;
        colorName: string;
      };
    };
    priority: {
      name: string;
      iconUrl: string;
    };
    assignee: {
      displayName: string;
      emailAddress: string;
      avatarUrls: { "48x48": string };
    } | null;
    reporter: {
      displayName: string;
      emailAddress: string;
      avatarUrls: { "48x48": string };
    };
    project: {
      key: string;
      name: string;
    };
    issuetype: {
      name: string;
      iconUrl: string;
    };
    created: string;
    updated: string;
    duedate: string | null;
    resolutiondate: string | null;
    comment: {
      total: number;
      comments: Array<{
        id: string;
        author: { displayName: string };
        body: string;
        created: string;
      }>;
    };
  };
}

export interface JiraSearchResult {
  total: number;
  issues: JiraIssue[];
  startAt: number;
  maxResults: number;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  avatarUrls: { "48x48": string };
}

export interface JiraUser {
  displayName: string;
  emailAddress: string;
  avatarUrls: { "48x48": string };
  accountId?: string;
  name?: string;
}


const JIRA_BASE_URL = process.env.JIRA_BASE_URL!;
const JIRA_PAT = process.env.JIRA_PAT!;

function getAuthHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${JIRA_PAT}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function jiraSearch(jql: string, fields?: string[], maxResults = 50): Promise<JiraSearchResult> {
  const fieldList = fields ?? [
    "summary",
    "status",
    "priority",
    "assignee",
    "reporter",
    "project",
    "issuetype",
    "created",
    "updated",
    "duedate",
    "resolutiondate",
    "comment",
  ];

  const url = new URL(`${JIRA_BASE_URL}/rest/api/2/search`);
  url.searchParams.set("jql", jql);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("fields", fieldList.join(","));

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Jira API error ${res.status}: ${text}`);
  }

  return res.json();
}

export async function jiraGetMyself(): Promise<JiraUser> {
  const res = await fetch(`${JIRA_BASE_URL}/rest/api/2/myself`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Jira API error ${res.status}`);
  }

  return res.json();
}


export function getStatusColor(categoryKey: string): string {
  switch (categoryKey) {
    case "new":
      return "secondary";
    case "indeterminate":
      return "default";
    case "done":
      return "outline";
    default:
      return "secondary";
  }
}


export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "blocker":
    case "critical":
      return "text-red-600";
    case "major":
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-yellow-500";
    case "minor":
    case "low":
      return "text-blue-400";
    case "trivial":
      return "text-gray-400";
    default:
      return "text-gray-500";
  }
}


export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(dateStr);
}

export function isDueToday(duedate: string | null): boolean {
  if (!duedate) return false;
  const today = new Date().toISOString().split("T")[0];
  return duedate.split("T")[0] === today;
}

export function isDueThisWeek(duedate: string | null): boolean {
  if (!duedate) return false;
  const now = new Date();
  const due = new Date(duedate);
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  return due >= now && due <= weekEnd;
}
