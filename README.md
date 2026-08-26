# TaskFlow / SprintDesk — Project Management Dashboard

A production-grade Project Management and Sprint Workflow Application built with **React 18**, **TypeScript**, **Vite**, **TanStack Query v5**, **Zustand**, and **Tailwind CSS**.

---

## 🔗 Submission & Deployment Links

- **GitHub Repository**: [https://github.com/gulam161/taskflow-dashboard](https://github.com/gulam161/taskflow-dashboard)
- **Live Deployment**: [https://taskflow-dashboard-xi.vercel.app](https://taskflow-dashboard-xi.vercel.app/login)
- **Architecture Document**: [architecture.md](./architecture.md)
- **API Documentation**: [docs/API.md](./docs/API.md)

---

## 🔑 Demo Credentials

The authentication system integrates with the [DummyJSON Auth API](https://dummyjson.com/docs/auth) with token refresh and protected routes:

- **Username**: `emilys`
- **Password**: `emilyspass`

_(Any valid DummyJSON user credentials will authenticate successfully)._

---

## 📋 Assessment Requirements Checklist

| Requirement                        | Description                                                                                  |   Status    | Implementation Details                                                                         |
| :--------------------------------- | :------------------------------------------------------------------------------------------- | :---------: | :--------------------------------------------------------------------------------------------- |
| **1. Authentication**              | Email/password, form validation, protected routes, session management, logout, token refresh | ✅ Complete | DummyJSON auth, `useAuthStore`, Axios interceptors for 401 retry, token refresh                |
| **2. Dashboard Summary Cards**     | Total Tasks, Pending Tasks, In Progress Tasks, Completed Tasks, High Priority Tasks          | ✅ Complete | Responsive cards on `/dashboard` and `/tasks` fetching summary metrics via TanStack Query      |
| **3. Task Management (DataTable)** | Title, Description, Assignee, Priority, Status, Due Date, Created Date                       | ✅ Complete | `/tasks` page using custom `DataTable` component with avatar, badges, and quick actions        |
| **4. CRUD via React Query**        | Create, Edit, Delete, View details, Status change                                            | ✅ Complete | `useMutation` hooks in `use-tasks.ts` invoking `taskService` with automatic query invalidation |
| **5. Search with Debounce**        | Search by Title with 500ms debouncing                                                        | ✅ Complete | Custom `useDebounce` hook with configurable 500ms delay and cancellation                       |
| **6. Filtering & Sorting**         | Status filter, Priority filter, Sort by Due Date (asc/desc)                                  | ✅ Complete | Toolbar controls integrated with TanStack Query params and Zustand UI store                    |
| **7. Pagination**                  | Page navigation, page size selector (5, 10, 20, 50), item counters                           | ✅ Complete | `Pagination.tsx` component with boundary disable and ellipsis handling                         |
| **8. Empty States**                | Contextual empty UI with descriptive message and actions                                     | ✅ Complete | `EmptyState.tsx` rendered on empty filter results and initial empty lists                      |
| **9. Network Error Handling**      | Error banner with message details and retry button                                           | ✅ Complete | `NetworkError.tsx` banner and top-level `ErrorBoundary.tsx`                                    |
| **10. Architecture & Tests**       | Clean service layer, Zustand + Query synergy, unit tests                                     | ✅ Complete | 72 / 72 Vitest unit and component tests passing                                                |

---

## 🏗️ Architecture Explanation

### State Management Strategy

We maintain a strict separation of concerns between **Server State** and **Client State**:

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Components Layer                      │
│     (TasksPage, TaskTable, KanbanBoard, DashboardPage)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Custom Hooks Layer                      │
│           (useTasks, useBoard, useAnalytics, useDebounce)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      TanStack Query v5       │ │       Zustand Stores       │
│        (Server State)        │ │        (Client State)      │
│  • Task list queries         │ │  • Filter inputs (search,  │
│  • Caching & invalidation    │ │    status, priority)       │
│  • CRUD mutations (create,   │ │  • Sort direction & page   │
│    update, delete, status)   │ │  • Modal & drawer states   │
│  • Summary metrics query     │ │  • Auth session & tokens   │
│  • Loading & error states    │ │  • Theme (dark/light mode) │
└──────────────┬───────────────┘ └─────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      Service / API Layer     │ │    localStorage Storage    │
│  (taskService, boardService, │ │   (Namespaced Persistence) │
│   authService)               │ │                            │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Sources                         │
│  • In-Memory Store / mock-data.json (Tasks, Sprints, Users) │
│  • DummyJSON API (Authentication & Token Refresh)           │
│  • JSONPlaceholder API (Live Notification Polling)          │
└─────────────────────────────────────────────────────────────┘
```

1. **Server State (TanStack Query v5)**:
   - Holds all remote/mock data: tasks, summary statistics, user list, and notifications.
   - Encodes search queries, filter values, sort orders, and page indices into query keys `['tasks', { search, status, priority, sortOrder, page, limit }]`.
   - Handles mutation lifecycles (`onSuccess` triggers query invalidation and toast alerts).

2. **Client State (Zustand)**:
   - Holds purely UI and session state: search input text, active filter dropdowns, sort toggle, current page index, modal open/close states, active theme, and auth tokens.
   - **Zero duplicated server state**: Task data is not stored in Zustand for the task management feature, keeping TanStack Query as the single source of truth.

3. **Service Layer (`task-service.ts`, `board-service.ts`, `auth-service.ts`)**:
   - Centralizes all data access and simulated async network latency (`await delay()`).
   - Ensures no direct `fetch` or HTTP logic is scattered across UI components.

---

## 📂 Project Structure

```text
src/
├── api/                        # Axios client, endpoints, and 401 refresh interceptors
├── app/                        # Root App, Providers (Query, Theme, ErrorBoundary), Router
│   ├── providers/              # QueryProvider, ThemeProvider, ErrorBoundary
│   └── router/                 # ProtectedRoute, PublicRoute, React.lazy code splitting
├── components/
│   ├── layout/                 # AppLayout, Header, Sidebar navigation
│   └── ui/                     # Reusable design system (Button, Input, Select, Modal,
│                               #   DataTable, Toast, Skeleton, ErrorBoundary)
├── features/
│   ├── auth/                   # Login screen, auth forms, auth-service, useAuth
│   ├── tasks/                  # Task Management Feature (Assessment Requirement)
│   │   ├── api/                # task-service.ts (GET, POST, PUT, DELETE)
│   │   ├── components/         # TaskTable, TaskManagementFilters, TaskFormModal,
│   │   │                       #   Pagination, EmptyState, NetworkError, SummaryCards
│   │   ├── hooks/              # use-tasks.ts, use-debounce.ts (500ms)
│   │   ├── pages/              # TasksPage.tsx (DataTable view & workflows)
│   │   └── store/              # task-ui-store.ts (Zustand client UI state)
│   ├── board/                  # Interactive Kanban board (@dnd-kit drag-and-drop)
│   ├── analytics/              # Recharts velocity, distribution, priority & trend charts
│   ├── dashboard/              # Sprint overview & 5 KPI summary cards
│   └── notifications/          # Live polling notification panel & toasts
├── stores/                     # Global theme store (dark/light)
├── types/                      # TypeScript definitions (auth, board, api, common)
├── utils/                      # Constants, date helpers, cn utility, storage wrapper
└── tests/                      # 10 Vitest suites covering hooks, services & components
```

---

## 📦 Libraries Used & Selection Rationale

| Library            | Version    | Why It Was Selected                                                                                                    |
| :----------------- | :--------- | :--------------------------------------------------------------------------------------------------------------------- |
| **React**          | `18.3.1`   | Industry-standard declarative UI library with Concurrent Mode, transitions, and hooks.                                 |
| **TypeScript**     | `~6.0.2`   | Compile-time type safety, autocompletion, interface contracts, and reduced runtime bugs.                               |
| **Vite**           | `^8.2.0`   | Lightning-fast development server with ES modules and optimized Rollup production builds.                              |
| **TanStack Query** | `v5.101.4` | Best-in-class server-state caching, mutation lifecycles, automatic query invalidation, and background synchronization. |
| **Zustand**        | `v5.0.15`  | Lightweight (<1KB), boilerplate-free client state management without context re-render penalties.                      |
| **Tailwind CSS**   | `v3.4.19`  | Utility-first styling with zero CSS bloat, seamless dark mode class toggling, and clean responsive modifiers.          |
| **React Router**   | `v6.30.6`  | Declarative client-side routing with route-level code splitting via `React.lazy` and `Suspense`.                       |
| **Recharts**       | `v3.10.1`  | Composable, responsive SVG charting library for interactive project analytics.                                         |
| **@dnd-kit**       | `v6.3.1`   | Modern, modular, accessible drag-and-drop for Kanban board column and task reordering.                                 |
| **Axios**          | `^1.19.0`  | Promise-based HTTP client with request/response interceptors for automatic JWT refresh handling.                       |
| **Vitest + RTL**   | `v4.1.11`  | Blazing-fast Vite-native testing framework paired with React Testing Library for user-centric assertions.              |

---

## ⚡ Performance Optimizations

1. **500ms Search Debouncing (`useDebounce`)**:
   - Prevents re-filtering and query execution on every single keystroke.
   - Cancels pending timers if the user continues typing.

2. **Route-Level Code Splitting (`React.lazy` & `Suspense`)**:
   - Each top-level route (`LoginPage`, `DashboardPage`, `TasksPage`, `BoardPage`, `AnalyticsPage`) is compiled into its own asynchronous chunk.
   - Initial bundle size is minimized, speeding up First Contentful Paint (FCP).

3. **TanStack Query Caching & Stale-While-Revalidate**:
   - Serves cached task data immediately while background refetching keeps data fresh.
   - Deduplicates identical concurrent requests across components.

4. **Memoized Computations & Callbacks (`useMemo`, `useCallback`)**:
   - Table columns, user lookup maps, and filter derivations are memoized to avoid redundant calculations across renders.
   - Handlers passed to child components maintain stable identities.

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation & Run Steps

```bash
# 1. Clone the repository
git clone https://github.com/gulam161/taskflow-dashboard.git
cd taskflow-dashboard

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite with Vitest:

```bash
# Run all unit and integration tests
npm run test

# Run TypeScript type check & production build
npm run build

# Run ESLint analysis
npm run lint
```

### Verified Test Results

```text
 ✓ src/tests/task-management.test.tsx (16 tests)
 ✓ src/tests/design-system.test.tsx (12 tests)
 ✓ src/tests/board-store.test.ts (9 tests)
 ✓ src/tests/notification-store.test.ts (7 tests)
 ✓ src/tests/analytics-service.test.ts (6 tests)
 ✓ src/tests/notification-components.test.tsx (6 tests)
 ✓ src/tests/utils.test.ts (6 tests)
 ✓ src/tests/auth-interceptor.test.ts (4 tests)
 ✓ src/tests/use-toast.test.tsx (3 tests)
 ✓ src/tests/notification-service.test.ts (3 tests)

 Test Files  10 passed (10)
      Tests  72 passed (72)
   Duration  9.54s
```

---

## 🌟 Bonus Features Implemented

- **TypeScript Strict Mode**: 100% strict type safety across all components, hooks, services, and tests.
- **Error Boundary**: Top-level `ErrorBoundary` catching unexpected React rendering errors with a recovery UI.
- **Dark / Light Mode**: Instant theme switching with system preference detection and localStorage persistence.
- **Accessibility (a11y)**: Full ARIA labels, semantic HTML tags, keyboard navigation (`Escape` dismissal, modal focus trap).
- **Toast Notifications**: Lightweight custom toast system for create/edit/delete feedback.
- **Kanban Board & Analytics**: Full interactive Kanban board with undo capability and 4 Recharts data visualizations.

---

## 🔮 Known Limitations & Future Improvements

If additional development time were available, the following enhancements would be added:

1. **Real Backend Integration**: Replace the in-memory simulated service with a production REST/GraphQL backend (e.g., PostgreSQL with Supabase or Node.js Express).
2. **Optimistic UI with Rollback**: Extend React Query mutations with `onMutate` optimistic updates and snapshot-based rollbacks on network failure.
3. **Multi-Column Sorting**: Support multi-column sorting (e.g., sort by Priority + Due Date simultaneously).
4. **Task Export**: Add CSV/PDF export capability for filtered task lists.
5. **WebSocket / SSE Live Sync**: Real-time multi-user collaboration and instant task update broadcasting.
