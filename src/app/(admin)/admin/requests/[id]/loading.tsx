export default function AdminRequestDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
          <div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-44 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-80 w-full animate-pulse rounded-lg bg-muted" />
            <div className="flex justify-end gap-2">
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
              <div className="h-5 w-28 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
