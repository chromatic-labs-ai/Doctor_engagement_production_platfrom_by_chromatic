export default function CompaniesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-80 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="rounded-md border">
          <div className="border-b p-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-b p-4 last:border-0">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
