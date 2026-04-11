import * as React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { UpdateCard, type Update } from "./changelog/UpdateCard";
import { loadChangelog } from "./changelog/loadChangelog";

/**
 * Minimal fallback if fetch fails (wrong deploy path, offline, or CORS on custom URL).
 * Keeps the page usable without bundling the full history into JS.
 */
const FALLBACK_UPDATES: Update[] = [
  {
    id: "changelog-unavailable",
    date: "—",
    title: "Changelog could not be loaded",
    tags: ["Chore"],
    sections: [
      {
        title: "What to try",
        items: [
          "Ensure `public/changelog.json` exists and the app is served over HTTP (Vite dev or production build).",
          "If using `VITE_CHANGELOG_URL`, verify the URL returns JSON and allows CORS from this origin.",
          "See repository `public/changelog.json` for the full history.",
        ],
      },
    ],
  },
];

export default function ChangelogPage() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await loadChangelog();
        if (!cancelled) {
          const list = Array.isArray(data.updates) ? data.updates : [];
          setUpdates(list);
          setUsedFallback(false);
        }
      } catch {
        if (!cancelled) {
          setUpdates(FALLBACK_UPDATES);
          setUsedFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className="h-70 sticky top-0 z-20 overflow-hidden flex items-center bg-gradient-to-br from-blue-500 to-black p-6 text-center text-white shadow-md sm:p-10
      rounded-b-sm">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2">
            <Badge className="bg-white/10 text-white hover:bg-white/20">
              Changelog
            </Badge>
            <span className="opacity-80 text-sm">Plug &amp; Play</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
            What&apos;s new?
          </h1>
          <p className="text-balance text-sm opacity-85 sm:text-base">
            Feature releases, enhancements, design updates, and important fixes.
            {import.meta.env.VITE_CHANGELOG_URL ? (
              <span className="block mt-1 text-xs opacity-75">
                Loaded from configured changelog URL.
              </span>
            ) : null}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-muted-foreground text-center text-sm">
            Loading changelog…
          </p>
        ) : usedFallback ? (
          <p className="text-destructive mb-6 text-center text-sm">
            Showing fallback message — could not load changelog data.
          </p>
        ) : null}

        <div className="grid gap-10">
          {updates.map((u, i) => (
            <React.Fragment key={u.id}>
              <UpdateCard update={u} />
              {i < updates.length - 1 && <hr className="border-t" />}
            </React.Fragment>
          ))}
        </div>
      </main>
    </div>
  );
}
