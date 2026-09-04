export default function PageLoading() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full border-2 border-blue-light" />
        <span
          className="h-3 w-3 animate-pulse-dot rounded-full bg-blue-light"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="h-3 w-3 animate-pulse-dot rounded-full bg-blue-light"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <p className="mt-6 text-sm text-muted">Chargement…</p>
    </main>
  );
}
