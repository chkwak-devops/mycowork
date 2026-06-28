# myCowork 하네스 엔지니어링 컨텍스트

## 1. 프로젝트 개요 및 아키텍처
myCowork는 Next.js (App Router) 기반의 개인 대시보드 애플리케이션으로, Atlassian의 Jira 및 Confluence (Data Center 버전)와 연동하여 업무를 관리하고 메트릭을 추적하며 문서를 생성합니다.

- **프레임워크**: Next.js 16 (App Router, Server Actions, API Routes)
- **스타일링**: Tailwind CSS + Shadcn UI (Lucide Icons)
- **상태 관리**: React Hooks (useState, useEffect, useCallback)
- **API 통신**: Atlassian REST API(Jira API v2, Confluence API) 대상 네이티브 fetch API

## 2. 핵심 하네스 기능 (에이전트 도구 컨텍스트)

### A. Jira 연동 (`lib/jira.ts`, `api/jira/*`)
- **인증 정보**: `JIRA_BASE_URL`과 `JIRA_PAT`을 안전한 서버 사이드에서 사용
- **추출 데이터**:
  - 개인 정보 (`jiraGetMyself`)
  - JQL 기반 이슈 검색 (`jiraSearch`)
- **주요 집계 메트릭**:
  - `myOpenTotal`, `myReportedTotal`
  - 마감 임박 (기한 중심 추적)
  - 방치 이슈 (관리되지 않는 이슈 추적)
  - 우선순위 분포

### B. Confluence 연동 (`lib/confluence.ts`, `api/confluence/*`)
- **인증 정보**: `CONFLUENCE_BASE_URL`과 `CONFLUENCE_PAT` 사용 (`JIRA_PAT`으로 폴백)
- **추출 데이터**:
  - 스페이스 목록 (`getSpaces`)
  - 스페이스 내 페이지 (`getPages`)
  - 최근 사용자 페이지 (`getMyRecentPages`)
- **변경 작업**:
  - 페이지 생성 (`createPage`): 일반 텍스트/Markdown을 Atlassian storage format(HTML)으로 변환

### C. 클라이언트 및 UI 구현 (`components/dashboard/*`)
- **글로벌 비활동 추적기**: `app/layout.tsx` + `components/inactivity-refresh.tsx` — 5분간 비활동 시 페이지 자동 새로고침
- **캘린더 뷰 (`calendar-view.tsx`)**:
  - `created`, `duedate`, `resolutiondate` 기준 월별 이슈 그리드 렌더링
  - 조회 한도 설정으로 페이지네이션 해결 (`maxResults: 300`)
  - 오버플로우 항목을 위한 대화형 "더보기" (`CalendarIssueModal`)
- **상위 지표 카드 (`stat-card.tsx`)**:
  - 주요 사용자 메트릭의 시각적 요약
  - 해당 메트릭과 관련된 특정 티켓을 보여주는 목록 뷰(`StatIssueModal`)로의 대화형 드릴다운
- **Confluence 상호 운용**: 업무 추적과 문서화 사이의 간극을 해소하는 모달 및 목록

## 3. 하네스 개선 기록 (적용된 수정 사항)
- **[기능] 글로벌 비활동 새로고침**: 키보드, 마우스, 터치 이벤트가 5분간 없으면 `window.location.reload()`를 실행하는 글로벌 타이머 추가
- **[기능] 캘린더 오버플로우 UX**: 특정 날짜에 3건 초과 이슈가 있을 때 "+X 더보기" 버튼과 오버레이 모달 구현
- **[기능] 메트릭 드릴다운 UX**: 상위 `StatCard`에 `onClick` 이벤트 연결, `IssueListModal`을 통해 메트릭 카테고리 내 Jira 티켓 미리보기
- **[시스템] API 페이지네이션 한도**: `/api/jira/calendar/route.ts`의 `maxResults`를 `300`으로 상향 조정

## 4. 에이전트 가이드라인 및 향후 유지보수 제약 사항
AI 에이전트(Sisyphus 등)가 이 저장소에서 작업을 수행할 때 반드시 준수해야 할 사항:

1. **보안**: `JIRA_PAT` 또는 `CONFLUENCE_PAT`을 클라이언트 사이드 컴포넌트(`"use client"`)에 절대 노출하지 않음. 모든 Jira/Confluence API 상호 작용은 `/lib` 함수에서 이루어지고 `/api` 라우트로 감싸져야 함.
2. **UI 일관성**: Shadcn UI 패턴을 활용. 새 오버레이는 `Dialog`(`components/ui/dialog`)를 사용하고, 새 버튼은 미리 정의된 `Button` variants를 사용해야 함.
3. **데이터 변경 규칙**: 모든 변경/삭제는 Atlassian에 REST 요청을 프록시하기 전에 서버 사이드 검증에 의존해야 함.
4. **코드베이스 위생**:
   - 모든 환경 테스트는 `.env.local`을 활용
   - `any` 타입은 적극적으로 리팩토링하여 제거. 현재 인터페이스(`JiraIssue`, `ConfluencePage`)는 엄격한 타입을 유지
   - 구조적 변경 후에는 `npm run build`를 실행하여 빌드 무결성 확인

## 5. 향후 로드맵
- **양방향 동기화**: 대시보드 모달에서 직접 이슈 상태 업데이트 또는 댓글 추가 기능
- **캐싱 및 속도 제한 보호**: Redis 또는 Next.js 안정적 캐싱 메커니즘을 도입하여 Jira/Confluence REST 엔드포인트 스로틀링 방지
- **JQL 빌더 UI**: 동적으로 JQL 문자열로 파싱되는 고급 필터링 UI
