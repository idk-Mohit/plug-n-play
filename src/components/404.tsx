import { activeViewAtom } from "@/state/ui/view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";

export default function NotFound() {
  const setView = useSetAtom(activeViewAtom);
  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header to match ChangelogPage */}
      <header className="sticky top-0 z-20 overflow-hidden bg-gradient-to-br from-blue-500 to-black p-6 text-center text-white shadow-md sm:p-10">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2">
            <Badge className="bg-white/10 text-white hover:bg-white/20">
              Plug &amp; Play
            </Badge>
            <span className="opacity-80 text-sm">Visualization System</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            Oops — page not found
          </h1>
          <p className="text-balance text-sm opacity-85 sm:text-base">
            The link might be broken or the page may have been moved.
          </p>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto grid max-w-4xl place-items-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="w-full rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur">
          <div className="flex flex-col items-center text-center">
            {/* Minimal on-brand illustration */}
            <svg
              aria-hidden="true"
              viewBox="0 0 200 100"
              className="mb-6 h-20 w-auto opacity-80"
            >
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#60a5fa" />
                  <stop offset="1" stopColor="#111827" />
                </linearGradient>
              </defs>
              <text
                x="0"
                y="70"
                fill="url(#g)"
                fontSize="64"
                fontFamily="ui-sans-serif, system-ui"
              >
                4 0 4
              </text>
            </svg>

            <h2 className="text-xl font-semibold">
              We couldn’t find that page
            </h2>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              Try going back, or head to the dashboard. If you think this is a
              bug, please open an issue so we can fix it.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={goBack} variant="secondary">
                Go back
              </Button>

              {/* If using react-router, you can wrap with <Link to="/"> using asChild */}
              <Button onClick={() => setView({ view: "dashboard" })}>
                Go to Home
              </Button>

              {/* Point this to your repo issues page */}
              <Button asChild variant="outline">
                <a
                  href="https://github.com/idk-Mohit/plug-n-play/issues/new"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report issue
                </a>
              </Button>
            </div>

            {/* Optional hint */}
            <p className="mt-4 text-xs text-muted-foreground">
              Error code: <span className="font-mono">404_NOT_FOUND</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
