# SprintDesk — Sprint Management Dashboard

A production-grade, single-page sprint management application built for software engineering teams. SprintDesk provides an end-to-end workspace for managing sprint lifecycles with real-time Kanban workflows, data visualizations, live background notification polling, role-based session management, and a custom design system built from scratch.

---

## Live Deployment & Submission Links

- **Live Deployment**: [https://sprintdesk-g.vercel.app](https://sprintdesk-g.vercel.app)
- **GitHub Repository**: [https://github.com/gulam161/sprintdesk.git](https://github.com/gulam161/sprintdesk.git)
- **Architecture Document**: [architecture.md](./architecture.md)
- **API Documentation**: [docs/API.md](./docs/API.md)

---

## Demo Credentials

The authentication system integrates with the [DummyJSON Auth API](https://dummyjson.com/docs/auth). You can authenticate using the standard demo credentials:

- **Username**: `emilys`
- **Password**: `emilyspass`

_(Any valid DummyJSON user credentials will authenticate successfully)._

---

## Technology Stack

| Category         | Technology     | Version    | Purpose                                             |
| ---------------- | -------------- | ---------- | --------------------------------------------------- |
| **Framework**    | React          | `18.3.1`   | Core UI engine                                      |
| **Language**     | TypeScript     | `~6.0.2`   | Strict mode typing (`strict: true`)                 |
| **Build Tool**   | Vite           | `^8.2.0`   | Fast dev server & optimized bundle building         |
| **Server State** | TanStack Query | `v5.101.4` | Caching, deduplication, polling lifecycle           |
| **Client State** | Zustand        | `v5.0.15`  | Global board, auth, notification & theme stores     |
| **Styling**      | Tailwind CSS   | `v3.4.19`  | Custom design tokens, dark mode, animations         |
| **Routing**      | React Router   | `v6.30.6`  | Route-level code-splitting with `lazy` & `Suspense` |
| **Charts**       | Recharts       | `v3.10.1`  | Responsive, animated data visualizations            |
| **Drag & Drop**  | @dnd-kit/core  | `v6.3.1`   | Accessible pointer & keyboard DnD                   |
| **Testing**      | Vitest + RTL   | `v4.1.11`  | Unit & component integration testing (56 tests)     |

---

> **Strict Prohibited Libraries Compliance**: 100% custom-built UI with Tailwind CSS.
> **Zero third-party UI component libraries** (No MUI, Ant Design, Chakra UI, Shadcn UI, or react-beautiful-dnd).

---

## Features

### Required Features

- **Secure Authentication Flow (Task 01)**:
  - Integration with DummyJSON `POST /auth/login`.
  - In-memory `accessToken` storage (never persisted in web storage).
  - Rotated `refreshToken` persistence in `localStorage`.
  - Automatic Axios request interceptor attaching `Bearer <token>`.
  - Silent `401 Unauthorized` response interceptor with concurrent request deduplication and transparent retry.
  - Route guards (`ProtectedRoute` & `PublicRoute`) and full-screen session initialization loader.
- **Interactive Kanban Sprint Board (Task 02)**:
  - Exactly the first 30 tasks seeded from `mock-data.json`.
  - 4 Kanban columns: `Backlog`, `In Progress`, `Review`, `Done`.
  - Cross-column and within-column drag-and-drop powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
  - Slide-over `TaskDrawer` with inline editing, metadata selectors, and real-time timestamped comments thread.
  - Add Task modal with input validation and Delete Task confirmation dialog.
  - Dynamic task count badges per column header.
  - Full board state persistence across page reloads via `localStorage`.
- **Sprint Analytics & Data Visualizations (Task 03)**:
  - Dedicated `/analytics` route.
  - **Sprint Velocity**: Bar chart showing completed vs. total tasks per sprint from real sprint data.
  - **Task Status Distribution**: Interactive Donut chart displaying column task proportions.
  - **Priority Breakdown**: Stacked bar chart showing priority distributions across columns.
  - **Completion Trend**: Area chart derived from actual task `completedAt` timestamps.
  - Dynamic reactivity: charts update automatically whenever board tasks are moved, created, or deleted.
  - Fully responsive down to 375px mobile viewports.
- **Custom UI Component Library (Task 04)**:
  - 7 custom components built from scratch with Tailwind CSS: `Button`, `Input`, `Select`, `Modal`, `Toast`, `DataTable`, and `Skeleton`.
  - Fully accessible with ARIA attributes, focus trapping, and keyboard controls.
- **Real-Time Notification Feed (Task 05)**:
  - Background polling against `https://jsonplaceholder.typicode.com/posts?_limit=5`.
  - Unseen post ID deduplication against `knownPostIds`.
  - Notification Bell with animated unread badge counter.
  - Notification Panel with latest 20 items and pagination for lists exceeding 20 items.
  - Mark as read / Mark all as read actions.
  - **Page Visibility API**: Automatically pauses polling when the browser tab is hidden and resumes when visible.
  - Closed-panel toast alerts firing exactly once per newly arrived notification.
- **Quality & Optimization (Task 06)**:
  - Route-level code splitting using `React.lazy` and `Suspense` with `RouteLoader`.
  - Strategic `useMemo` and `useCallback` implementations.
  - Keyboard navigation (ESC key dismissal on drawers, modals, panels).
  - 100% test pass rate across 9 test suites.

### Optional Bonuses Implemented

- **Undo Move Action**: Snapshot-based rollback for accidental drag-and-drop actions.
- **Keyboard-Accessible Drag-and-Drop**: Sortable keyboard coordinates sensor for full keyboard board navigation.
- **Multi-Criteria Search & Filtering**: Real-time keyword search alongside priority and assignee dropdown filters.
- **Theme System**: Seamless dark and light mode toggle with system preference auto-detection and persistence.

---

## State Management Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                       UI Components                         │
│   (KanbanBoard, TaskDrawer, Charts, NotificationPanel, ...) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Custom Hooks Layer                       │
│    (useAuth, useBoard, useAnalytics, useNotifications)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      TanStack Query v5       │ │       Zustand Stores       │
│  (Caching, Polling, Refresh) │ │ (Board, Auth, Notification)│
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│     Service Layer / API      │ │    localStorage Storage    │
│  (auth, board, notifications)│ │   (Namespaced Persistence) │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Sources                         │
│  • DummyJSON (Auth/Refresh)                                 │
│  • JSONPlaceholder (Simulated Notification Polling)         │
│  • mock-data.json (Initial Board Tasks, Sprints, Comments)  │
└─────────────────────────────────────────────────────────────┘
```

1. **Server State (TanStack Query v5)**: Manages network queries, query keys, caching, request deduplication, and tab-visibility-controlled background polling.
2. **Client State (Zustand)**: Manages memory-only authentication sessions, interactive Kanban board ordering, notifications, and theme settings.
3. **Local Component State (`useState`, `useRef`)**: Confined to transient UI concerns (modal visibility, form field values, dropdown toggles).

---

## Project Structure

```text
src/
├── api/                        # HTTP client and Axios interceptors
├── app/                        # App root, providers, and React Router routes
├── components/
│   ├── layout/                 # AppLayout, Header, Sidebar
│   └── ui/                     # Custom Design System components
├── features/
│   ├── auth/                   # Authentication forms, hooks, services, stores
│   ├── board/                  # Kanban board, cards, drawers, modals, filters
│   ├── analytics/              # Recharts visualizations and KPI summaries
│   ├── dashboard/              # Active sprint overview and data tables
│   └── notifications/          # Notification bell, panel, and polling hooks
├── stores/                     # Theme store
├── types/                      # TypeScript definitions (auth, board, api, common)
├── utils/                      # Constants, date helpers, storage abstractions
└── tests/                      # Vitest unit and integration test suites
```

---

## Getting Started Locally

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Run Commands

```bash
# 1. Clone the repository
git clone https://github.com/gulam161/sprintdesk.git
cd sprintdesk

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## Environment Variables

**No environment variables are required for the current implementation.** Built-in fallback constants in `src/utils/constants.ts` handle default API base URLs.

An optional template is provided in [.env.example](./.env.example):

```env
# Optional API URL overrides
# VITE_API_BASE_URL=https://dummyjson.com
# VITE_JSON_PLACEHOLDER_URL=https://jsonplaceholder.typicode.com
```

---

## Verification & Testing Commands

Execute the test suites and static analysis tools using the following commands:

```bash
# Run complete unit and integration test suite
npm run test

# Run ESLint static analysis
npm run lint

# Compile TypeScript and build production bundle
npm run build
```

### Verified Test Suite Output

```
 ✓ src/tests/notification-store.test.ts (7 tests)
 ✓ src/tests/analytics-service.test.ts (6 tests)
 ✓ src/tests/utils.test.ts (6 tests)
 ✓ src/tests/use-toast.test.tsx (3 tests)
 ✓ src/tests/auth-interceptor.test.ts (4 tests)
 ✓ src/tests/design-system.test.tsx (12 tests)
 ✓ src/tests/notification-components.test.tsx (6 tests)
 ✓ src/tests/board-store.test.ts (9 tests)
 ✓ src/tests/notification-service.test.ts (3 tests)

 Test Files  9 passed (9)
      Tests  56 passed (56)
```

| Verification         | Command         | Status                                          |
| -------------------- | --------------- | ----------------------------------------------- |
| **Vitest Tests**     | `npm run test`  | **56 / 56 passed** (100%)                       |
| **TypeScript Check** | `tsc -b`        | **0 errors**                                    |
| **ESLint Analysis**  | `npm run lint`  | **0 errors, 0 warnings**                        |
| **Production Build** | `npm run build` | **Clean build** with route-level code splitting |

---

## Deployment & SPA Routing Configuration

SprintDesk is deployed on **Vercel** with dedicated Single Page Application (SPA) rewrite rules in [vercel.json](./vercel.json) and [public/\_redirects](./public/_redirects) to ensure page refreshes on subpaths (`/dashboard`, `/board`, `/analytics`, `/login`) resolve seamlessly to `index.html` without 404 errors.

---

## Recommended Screen Recording Walkthrough

For evaluators or recording demonstrations, the recommended 15-step sequence is:

1. **Login**: Navigate to `/login`, enter demo credentials (`emilys` / `emilyspass`), and observe the full-screen session loader.
2. **Dashboard Overview**: View the active sprint summary, KPI cards, and the actionable tasks `DataTable`.
3. **Kanban Navigation**: Navigate to `/board` and review the 4 workflow columns seeded with the first 30 tasks.
4. **Drag & Drop Reordering**: Drag a task card within the same column to adjust priority order.
5. **Cross-Column Transition**: Drag a task from `Backlog` to `In Progress` or `Review` to `Done`.
6. **Undo Last Move**: Click the "Undo Move" button to roll back the column transition.
7. **Task Details Drawer**: Click any task card to open the slide-over drawer; update title/description inline.
8. **Comment Thread**: Post a new timestamped comment in the task drawer.
9. **Add Task**: Open the "Add Task" modal, fill in details, and submit to create a new task card.
10. **Delete Task**: Trigger task deletion and confirm via the modal dialog.
11. **Search & Filters**: Filter tasks by Priority (`High`), Assignee, and keyword search.
12. **Analytics Visualizations**: Navigate to `/analytics` and inspect the 4 dynamic charts (Velocity, Status, Priority, Trend).
13. **Theme Switching**: Toggle the sun/moon button in the header to switch between light and dark modes.
14. **Notifications**: Click the notification bell to open the panel, mark an item as read, and observe pagination.
15. **Logout**: Click the logout button to clear session state and return to `/login`.
