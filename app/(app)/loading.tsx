export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-muted/50 animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted/30 animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-muted/20 border border-border/30 animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-64 rounded-2xl bg-muted/20 border border-border/30 animate-pulse" />
    </div>
  );
}
