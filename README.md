# myCowork — Jira 대시보드 & Confluence 연동

사내 Jira / Confluence(Data Center)와 연동하여 개인 업무를 대시보드에서 관리하고 Confluence 페이지를 생성할 수 있는 Next.js 애플리케이션입니다.

## 기능

- **Jira 대시보드** — 내 담당 이슈, 보고한 이슈, 마감 임박, 최근 활동 등을 한눈에 확인
- **Confluence 페이지 생성** — 대시보드에서 Space/부모 페이지를 선택하여 Confluence 페이지를 바로 작성
  - Space 검색 및 선택
  - 부모 페이지 검색 (Command Palette)
  - HTML storage format 자동 변환

## 환경 변수 설정

`.env.local` 파일에 다음 값을 설정해야 합니다.

```env
# ---- Confluence ----
CONFLUENCE_BASE_URL=https://confluence.example.com
CONFLUENCE_PAT=your_confluence_personal_access_token

# ---- Jira ----
JIRA_BASE_URL=https://jira.example.com
JIRA_PAT=your_jira_personal_access_token
JIRA_USER_EMAIL=your_email@example.com
NEXT_PUBLIC_JIRA_BASE_URL=https://jira.example.com
NEXT_PUBLIC_CONFLUENCE_BASE_URL=https://confluence.example.com
```

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `CONFLUENCE_BASE_URL` | Confluence 서버 주소 | — |
| `CONFLUENCE_PAT` | Confluence Personal Access Token | `JIRA_PAT`으로 fallback |
| `CONFLUENCE_SPACE_KEY` | 허용할 Confluence Space 키 (설정 시 해당 Space만 표시) | 전체 Space |
| `JIRA_BASE_URL` | Jira 서버 주소 | — |
| `JIRA_PAT` | Jira Personal Access Token | — |
| `NEXT_PUBLIC_JIRA_BASE_URL` | 브라우저에서 사용할 Jira URL | — |
| `NEXT_PUBLIC_CONFLUENCE_BASE_URL` | 브라우저에서 사용할 Confluence URL | — |

> PAT는 Jira / Confluence Data Center의 **Personal Access Token** 설정에서 발급받을 수 있습니다.  
> 두 서비스가 동일한 SSO를 사용한다면 같은 PAT로도 동작하지만, 별도 발급을 권장합니다.

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 대시보드를 확인할 수 있습니다.

## 빌드

```bash
npm run build
```

## API Routes

| Route | Method | 설명 |
|-------|--------|------|
| `/api/jira/dashboard` | GET | Jira 대시보드 데이터 (유저, 이슈, 통계) |
| `/api/confluence/spaces` | GET | Confluence Space 목록 |
| `/api/confluence/pages?spaceKey=KEY` | GET | 특정 Space의 페이지 트리 |
| `/api/confluence` | POST | Confluence 페이지 생성 |

## 기술 스택

- **Framework**: Next.js (App Router, Turbopack)
- **UI**: shadcn/ui + Base UI (@base-ui/react)
- **Charts**: Recharts
- **Icons**: Lucide
- **Language**: TypeScript

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   ├── confluence/   # Confluence API 프록시
│   │   └── jira/         # Jira API 프록시
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── confluence/       # Confluence 관련 컴포넌트
│   ├── dashboard/        # 대시보드 컴포넌트
│   └── ui/              # shadcn/ui 컴포넌트
└── lib/
    ├── confluence.ts     # Confluence API 클라이언트
    └── jira.ts           # Jira API 클라이언트
```
