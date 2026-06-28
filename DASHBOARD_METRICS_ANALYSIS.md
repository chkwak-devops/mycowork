# Dashboard Metrics Cards - Component Analysis

## 📊 Summary

The dashboard displays **5 metric cards** at the top (lines 204-240 in `dashboard-client.tsx`). All cards render via the `StatCard` component. **All necessary issue data is already in component state** — no new API calls needed to implement clickability.

## 📁 Key Files

| File | Lines | Purpose |
|------|-------|---------|
| `components/dashboard/stat-card.tsx` | 27 | Individual metric card renderer |
| `components/dashboard/dashboard-client.tsx` | 204-240 | Card rendering + state management |
| `components/dashboard/issue-list-card.tsx` | 56 | Reusable issue list display |
| `components/dashboard/issue-row.tsx` | 60+ | Individual issue row with Jira link |

## 📊 The 5 Metrics Cards

### Card #1: "내 미완료 이슈" (My Open Issues)
- **Display Value**: `data.myOpenTotal` (number)
- **Full Data**: `data.myOpenIssues` (JiraIssue[])
- **Icon**: CheckCircle (blue-500)
- **Subtitle**: "담당자로 할당된 이슈"

### Card #2: "내가 보고한 이슈" (Reported by Me)
- **Display Value**: `data.myReportedTotal` (number)
- **Full Data**: `data.myReportedIssues` (JiraIssue[])
- **Icon**: FileText (purple-500)
- **Subtitle**: "최근 30일"

### Card #3: "마감 임박" (Due Soon)
- **Display Value**: `data.dueSoonIssues.length` (number)
- **Full Data**: `data.dueSoonIssues` (JiraIssue[])
- **Icon**: Clock (orange/red-500)
- **Subtitle**: Shows overdue count or "이번 주 마감"

### Card #4: "최근 활동" (Recent Activity)
- **Display Value**: `data.recentActivityIssues.length` (number)
- **Full Data**: `data.recentActivityIssues` (JiraIssue[])
- **Icon**: Activity (green-500)
- **Subtitle**: "최근 7일 업데이트"

### Card #5: "방치 이슈" (Stale Issues)
- **Display Value**: `data.staleIssues.length` (number)
- **Full Data**: `data.staleIssues` (JiraIssue[])
- **Icon**: AlertTriangleIcon (color varies)
- **Subtitle**: "최장 N일" or "모든 이슈가 관리 중"

## 🎨 StatCard Component

### Current Props
```typescript
interface StatCardProps {
  title: string;                // e.g., "내 미완료 이슈"
  value: number;                // Number to display (e.g., 12)
  sub?: string;                 // Subtitle text
  icon: LucideIcon;             // Icon component
  iconColor?: string;           // Tailwind color (default: "text-muted-foreground")
  accentColor?: string;         // Left bar color (default: "bg-primary/10")
}
```

### Current Styling
- ✅ Hover effect: `hover:scale-[1.02]`
- ✅ Active effect: `active:scale-[0.98]`
- ✅ Icon scales on hover
- ✅ Smooth 150ms transitions
- ❌ **No onClick handler**
- ❌ **No cursor-pointer class**

### Current Layout
```
grid-cols-2 md:grid-cols-5 gap-4
└─ 2 columns on mobile, 5 columns on desktop
```

## 🔗 Data Flow

```
/api/jira/dashboard (API call)
    ↓
DashboardClient state:
  - myOpenIssues[]
  - myReportedIssues[]
  - dueSoonIssues[]
  - recentActivityIssues[]
  - staleIssues[]
    ↓
StatCard (receives counts only)
    ↓ [NEEDED: onClick handler + modal]
    ↓
[NEW] MetricsListModal
    ↓
IssueListCard (receives full array)
    ↓
IssueRow[] (renders each issue with Jira link)
```

## 📦 Ready-to-Use Components

### IssueListCard
```typescript
interface IssueListCardProps {
  title: string;                    // Modal title
  issues: JiraIssue[];              // Array to display
  total?: number;                   // Shows "X개" badge
  jiraBaseUrl: string;              // For issue links
  showDueDate?: boolean;            // Optional columns
  showUpdated?: boolean;
  emptyMessage?: string;
}
```

**Features**:
- Renders issue list with IssueRow component
- Shows total count badge
- Handles empty state
- Customizable columns

### IssueRow
**Displays**:
- Issue key (linked to Jira, opens in new tab)
- Priority dot (color-coded)
- Status badge (color-coded)
- Issue type
- Summary (title)
- Project name
- Optional: Due date (with overdue highlighting)
- Optional: Updated date (human-readable)

**Styling**:
- Hover background
- Left border accent on hover
- Proper text truncation

## ✨ Key Advantages

1. **Zero API Changes**: All issue arrays already in state
2. **Styling Ready**: Hover/active effects already present
3. **Reusable Components**: IssueListCard & IssueRow exist and work
4. **Minimal Changes**: Just add onClick to StatCard, create modal wrapper
5. **User Experience**: Existing hover feedback primes user for clickability

## 🚀 Implementation Steps

### 1. Extend StatCard Props
```typescript
interface StatCardProps {
  // ... existing props ...
  onClick?: () => void;
}
```

Update Card element:
- Add `cursor-pointer` class when `onClick` provided
- Bind click handler to Card

### 2. Add State to DashboardClient
```typescript
const [selectedMetric, setSelectedMetric] = useState<
  'open' | 'reported' | 'dueSoon' | 'recent' | 'stale' | null
>(null);
```

### 3. Create Modal Component
Options:
- **Dialog** (overlay from shadcn/ui)
- **Drawer** (side panel from shadcn/ui)
- **Custom Modal** (similar to CreateConfluencePageModal)

### 4. Connect StatCards to Modal
```typescript
<StatCard
  title="내 미완료 이슈"
  value={data.myOpenTotal}
  onClick={() => setSelectedMetric('open')}
  // ... rest of props
/>
```

And render modal:
```typescript
{selectedMetric === 'open' && (
  <MetricsListModal
    title="내 미완료 이슈"
    issues={data.myOpenIssues}
    onClose={() => setSelectedMetric(null)}
  />
)}
```

## 📋 Testing

- [ ] Click each of 5 metric cards
- [ ] Verify correct issues display
- [ ] Verify issue count matches card number
- [ ] Click issue → navigates to Jira
- [ ] Modal closes on dismiss
- [ ] Responsive on mobile
- [ ] Hover effect still visible on cards

## 🎯 Expected UX Flow

1. User sees dashboard with 5 metric cards
2. Hover over card → scale-up feedback (already works)
3. Click card → modal opens with full issue list
4. See all issues in category with key, title, status, priority, due date
5. Click issue title/key → opens in Jira (new tab)
6. Click close or outside modal → returns to dashboard

---

**Status**: Ready for implementation. All data and components are in place.
