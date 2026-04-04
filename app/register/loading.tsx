export default function RegisterRouteLoading() {
  return (
    <div className="mx-auto max-w-md flex-1 px-4 py-16 sm:px-6">
      <div className="h-4 w-32 animate-pulse rounded bg-[var(--shop-border)]" />
      <div className="mt-8 rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-8">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--shop-border)]" />
        <div className="mt-8 space-y-4">
          <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--shop-border)]" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--shop-border)]" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-[var(--shop-border)]" />
          <div className="h-11 w-full animate-pulse rounded-full bg-[var(--shop-border)]" />
        </div>
      </div>
    </div>
  );
}
