# myCowork Harness Engineering Context

## 1. Project Overview & Architecture
myCowork is a Next.js (App Router) based personal dashboard application that seamlessly integrates with Atlassian's Jira and Confluence (Data Center versions) to manage tasks, track metrics, and generate documentation.

- **Framework**: Next.js 16 (App Router, Server Actions, API Routes)
- **Styling**: Tailwind CSS + Shadcn UI (Lucide Icons)
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **API Communication**: Native fetch API pointing to Atlassian REST APIs (Jira API v2, Confluence API)

## 2. Core Harness Capabilities (Agent Tooling Context)
The following components define the core capabilities of the application:

### A. Jira Integration (`lib/jira.ts`, `api/jira/*`)
- **Credentials**: Uses `JIRA_BASE_URL` and `JIRA_PAT` for secure server-side fetching.
- **Data Extracted**:
  - Personal Information (`jiraGetMyself`)
  - Issues search via JQL (`jiraSearch`)
- **Key Metrics Aggregated**:
  - `myOpenTotal`, `myReportedTotal`
  - Due soon (Deadline-oriented tracking)
  - Stale Issues (Neglected issue tracking)
  - Priority distributions

### B. Confluence Integration (`lib/confluence.ts`, `api/confluence/*`)
- **Credentials**: Uses `CONFLUENCE_BASE_URL` and `CONFLUENCE_PAT` (with fallback to `JIRA_PAT`).
- **Data Extracted**:
  - Spaces List (`getSpaces`)
  - Pages within Spaces (`getPages`)
  - Recent User Pages (`getMyRecentPages`)
- **Mutation Action**:
  - Page Creation (`createPage`): Converts simple Markdown/Text to Atlassian's storage format (HTML).

### C. Client & UI Implementations (`components/dashboard/*`)
- **Global Inactivity Tracker**: Implemented in `app/layout.tsx` + `components/inactivity-refresh.tsx` to force page reloads after 5 minutes of inactivity.
- **Calendar View (`calendar-view.tsx`)**:
  - Grid rendering of monthly issues based on `created`, `duedate`, or `resolutiondate`.
  - Pagination offset resolved by querying limits (`maxResults: 300`).
  - Interactive "See More" (`CalendarIssueModal`) to view overflow items.
- **Top Metric Cards (`stat-card.tsx`)**:
  - Visual summary of critical user metrics.
  - Interactive drill-down to a list view (`StatIssueModal`) showing specific tickets related to that metric.
- **Confluence Interop**: Modals and lists to bridge the gap between task tracking and documentation.

## 3. Harness Enhancement Log (Modifications Applied)
- **[Feature] Global Inactivity Refresh**: Added global timer to refresh `window.location.reload()` after 5 minutes of no keyboard, mouse, or touch events.
- **[Feature] Calendar Overflow UX**: Implemented a "+X 더보기" button and an overlay modal to support rendering >3 issues efficiently on specific calendar days.
- **[Feature] Metric Drill-down UX**: Modified top-level `StatCard`s to respond to `onClick` events. Hooked up an `IssueListModal` to quickly preview Jira tickets within the metric category.
- **[System] API Pagination Limits**: Bumped `maxResults` to `300` in `/api/jira/calendar/route.ts` to accommodate dense schedules.

## 4. Agent Guidelines & Future Maintenance Constraints
When AI Agents (Sisyphus or others) execute work in this repository, they MUST adhere to:
1. **Security**: Never expose `JIRA_PAT` or `CONFLUENCE_PAT` to client-side components (`"use client"`). All Jira/Confluence API interaction must happen in `/lib` functions and be wrapped in `/api` routes.
2. **UI Consistency**: Leverage Shadcn UI patterns. New overlays must use `Dialog` (`components/ui/dialog`), and new buttons should use the predefined `Button` variants.
3. **Data Mutation Rules**: All changes/deletions must rely on server-side validations before proxying REST requests to Atlassian.
4. **Codebase Hygiene**:
   - Utilize `.env.local` for all environment tests.
   - Refactor `any` types out aggressively. Current interfaces (`JiraIssue`, `ConfluencePage`) must be strictly typed.
   - Ensure build integrity by firing `npm run build` after any structural modifications.

## 5. Potential Future Roadmaps
- **Bi-directional Sync**: Ability to update issue status or add comments directly from the dashboard modals.
- **Caching & Rate Limit Safeguards**: Implement Redis or Next.js stable caching mechanisms to prevent throttling from Jira/Confluence REST endpoints.
- **JQL Builder UI**: Advanced filtering UI dynamically parsing into JQL strings.
