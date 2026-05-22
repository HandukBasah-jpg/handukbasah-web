export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-in fade-in duration-300">
        {/* Logo skeleton */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-muted/50 animate-pulse" />
          <div className="h-6 w-36 rounded-lg bg-muted/30 animate-pulse" />
        </div>

        {/* Card skeleton */}
        <div className="h-80 rounded-2xl bg-muted/20 border border-border/30 animate-pulse" />
      </div>
    </div>
  );
}
