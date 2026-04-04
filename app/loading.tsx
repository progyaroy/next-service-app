export default function HomeRouteLoading() {
  return (
    <div className="mx-auto max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <div className="h-4 w-40 animate-pulse rounded bg-[var(--shop-border)]" />
      <div className="mt-4 h-12 w-full max-w-md animate-pulse rounded-lg bg-[var(--shop-border)]" />
      <div className="mt-6 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-[var(--shop-border)]" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--shop-border)]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--shop-border)]" />
      </div>
      <div className="mt-10 flex gap-3">
        <div className="h-10 w-32 animate-pulse rounded-full bg-[var(--shop-border)]" />
        <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--shop-border)]" />
      </div>
    </div>
  );
}
