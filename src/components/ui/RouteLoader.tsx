export function RouteLoader() {
  return (
    <div className="w-full h-96 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
        Loading...
      </span>
    </div>
  );
}
