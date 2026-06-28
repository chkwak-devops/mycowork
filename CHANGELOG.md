# Changelog

프로젝트 myCowork의 모든 주요 변경 사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/)을 따릅니다.

---

## [Unreleased]

### 추가
- AI 에이전트 온보딩을 위한 하네스 엔지니어링 컨텍스트 문서 (`.agent/agent.md`)
- 대시보드 메트릭 분석 문서 (`DASHBOARD_METRICS_ANALYSIS.md`)
- 카드 뉴스 HTML 페이지 (`public/card-news.html`)

### 변경
- `.gitignore` — `.sisyphus/` 디렉토리 패턴 추가

---

## [2026-06-29] — 테마, 캘린더 UX, 비활동 새로고침

### 추가
- **테마 시스템**: `AccentThemeProvider` 및 `ThemeSelector` 컴포넌트 (`components/ui/theme-provider.tsx`, `components/ui/theme-selector.tsx`)
- **캘린더 오버플로우 UI**: `CalendarIssueModal` — 특정 날짜에 이슈가 많을 때 전체 목록을 모달로 조회
- **지표 카드 드릴다운**: `StatIssueModal` — 상단 지표 카드 클릭 시 해당하는 이슈 목록을 모달로 표시
- **글로벌 비활동 새로고침**: `InactivityRefresh` 컴포넌트 — 5분간 사용자 입력이 없으면 페이지 자동 새로고침
- 강조 색상 테마를 위한 글로벌 스타일 및 Next.js 설정

### 변경
- **캘린더 API** (`app/api/jira/calendar/route.ts`): `maxResults`를 100에서 300으로 증가
- **캘린더 뷰** (`calendar-view.tsx`): 3건 초과 시 "+X 더보기" 버튼으로 대체
- **대시보드 클라이언트** (`dashboard-client.tsx`): 지표 카드에 `onClick` 핸들러 및 모달 연결
- **StatCard** (`stat-card.tsx`): `onClick` prop 추가, 클릭 가능 시 포인터 커서 및 호버 애니메이션
- **루트 레이아웃** (`app/layout.tsx`): `InactivityRefresh` 컴포넌트 통합

---

## [2026-06-15] — 캘린더 & 컨플루언스 연동

### 추가
- **Jira 캘린더 API** (`app/api/jira/calendar/route.ts`): 마감일, 생성일, 해결일 기준 월별 이슈 조회
- **캘린더 뷰 컴포넌트** (`components/dashboard/calendar-view.tsx`): 월간 달력 그리드 및 일별 이슈 목록
- **Confluence 내 페이지 API** (`app/api/confluence/my-pages/route.ts`): 현재 사용자의 최근 생성/업데이트 페이지 조회
- **Confluence 최근 페이지 컴포넌트** (`components/dashboard/recent-confluence-pages.tsx`): "더보기" 확장 기능이 있는 목록 카드

### 변경
- **대시보드 클라이언트** (`dashboard-client.tsx`): `CalendarView` 및 `RecentConfluencePages` 통합, 월별 탐색 및 비동기 로딩 추가

---

## [2026-06-11] — 초기 애플리케이션 스캐폴드

### 추가
- **프로젝트 설정**: Next.js 16 App Router + TypeScript + Tailwind CSS + shadcn/ui
- **Jira 연동** (`lib/jira.ts`):
  - JQL 기반 이슈 검색 (`jiraSearch`)
  - 사용자 프로필 조회 (`jiraGetMyself`)
  - 대시보드 API (`app/api/jira/dashboard/route.ts`) — 미완료/보고/마감임박/최근활동/방치 이슈 집계, 우선순위 분포, 프로젝트 통계
- **Confluence 연동** (`lib/confluence.ts`):
  - 스페이스 목록 (`getSpaces`)
  - 페이지 목록 (`getPages`)
  - 페이지 생성 (`createPage`)
  - 페이지 검색 (`getMyRecentPages`)
  - API 라우트: spaces, pages, create, my-pages
- **대시보드 UI 컴포넌트**:
  - `StatCard` — 지표 요약 카드
  - `IssueListCard` — 우선순위/상태 뱃지가 있는 스크롤 가능 이슈 목록
  - `IssueRow` — 개별 이슈 행 컴포넌트
  - `ProjectStatsCard` — 프로젝트별 진행률 바
  - `PriorityChart` — 우선순위 분포 차트
  - `DashboardSkeleton` — 로딩 플레이스홀더
- **대시보드 페이지** (`app/page.tsx`): `DashboardClient` 렌더링 메인 엔트리
- **Confluence 페이지 생성 모달**: 스페이스/부모 페이지 선택, Confluence storage format 변환
- **인증**: PAT 기반 Bearer 토큰 (Jira, Confluence API)

### 변경
- **의존성**: shadcn/ui 컴포넌트, `lucide-react`, `next-themes` 추가
- **설정**: `next.config.ts` — `JIRA_BASE_URL`, `CONFLUENCE_BASE_URL` 이미지 remote 패턴 허용
- **글로벌 스타일**: 베이스 레이아웃, font-geist 변수, 전체 높이 플렉스 구조

### 수정
- `.gitignore` — playwright 로그, 임시 파일, Confluence 마크다운 아티팩트 항목 추가
