import { useLocation } from "react-router-dom";
import { useThemeStore } from "@/stores/theme-store";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { NotificationPanel } from "@/features/notifications/components/NotificationPanel";
import { storage, STORAGE_KEYS } from "@/utils/storage";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const routeTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of sprint performance and KPIs",
  },
  "/board": {
    title: "Kanban Board",
    subtitle: "Sprint 3 tasks and active workflows",
  },
  "/analytics": {
    title: "Analytics",
    subtitle: "Real-time velocity, distribution, and trends",
  },
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { user, clearSession } = useAuthStore();

  const {
    paginatedNotifications,
    unreadCount,
    currentPage,
    totalPages,
    totalNotifications,
    isPanelOpen,
    togglePanel,
    setPanelOpen,
    setPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const currentRoute = routeTitles[location.pathname] || {
    title: "SprintDesk",
    subtitle: "Sprint Management Dashboard",
  };

  const handleLogout = () => {
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    clearSession();
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open navigation sidebar"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Route header info */}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {currentRoute.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
            {currentRoute.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === "dark" ? (
            <svg
              className="w-5 h-5 text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>

        {/* Notification Bell & Panel */}
        <div className="relative">
          <NotificationBell
            unreadCount={unreadCount}
            isOpen={isPanelOpen}
            onClick={togglePanel}
          />

          <NotificationPanel
            isOpen={isPanelOpen}
            onClose={() => setPanelOpen(false)}
            notifications={paginatedNotifications}
            unreadCount={unreadCount}
            currentPage={currentPage}
            totalPages={totalPages}
            totalNotifications={totalNotifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDelete={deleteNotification}
            onClearAll={clearAll}
            onPageChange={setPage}
          />
        </div>

        {/* User profile / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          {user?.image ? (
            <img
              src={user.image}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold text-xs flex items-center justify-center">
              {user ? `${user.firstName?.[0] || "U"}` : "U"}
            </div>
          )}

          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : "Developer"}
            </p>
            <p className="text-[10px] text-slate-400 truncate max-w-[100px]">
              {user?.email || "user@example.com"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out of application"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
