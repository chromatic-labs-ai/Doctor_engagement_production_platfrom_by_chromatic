export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted sm:w-80" />
        <div className="rounded-md border bg-card">
          <div className="border-b p-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b p-4 last:border-0">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-7 w-12 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
