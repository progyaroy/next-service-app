export default function AccountRouteLoading() {
  return (
    <div className="mx-auto max-w-2xl flex-1 px-4 py-12 sm:px-6">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-[var(--shop-border)]" />
      <div className="mt-4 h-4 w-72 animate-pulse rounded bg-[var(--shop-border)]" />
      <div className="mt-10 h-48 animate-pulse rounded-2xl bg-[var(--shop-border)]" />
    </div>
  );
}
