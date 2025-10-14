import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background">
          <header className="sticky top-0 z-20 overflow-hidden bg-gradient-to-br from-blue-500 to-black p-6 text-center text-white shadow-md sm:p-10">
            <div className="mx-auto max-w-4xl space-y-3">
              <div className="inline-flex items-center gap-2">
                <Badge className="bg-white/10 text-white hover:bg-white/20">
                  Plug &amp; Play
                </Badge>
                <span className="opacity-80 text-sm">Visualization System</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Something went wrong
              </h1>
              <p className="text-balance text-sm opacity-85 sm:text-base">
                An unexpected error occurred while rendering this page.
              </p>
            </div>
          </header>

          <main className="mx-auto grid max-w-4xl place-items-center px-4 py-14 sm:px-6 lg:px-8">
            <div className="w-full rounded-2xl border bg-card/50 p-8 shadow-sm backdrop-blur">
              <div className="flex flex-col items-center text-center">
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
                    ERROR
                  </text>
                </svg>

                <h2 className="text-xl font-semibold">
                  {this.state.error?.message || "Something broke unexpectedly."}
                </h2>
                <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                  You can try reloading the app or returning to the home page.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button onClick={this.handleReload} variant="secondary">
                    Reload page
                  </Button>

                  <Button asChild>
                    <a href="/">Go to Home</a>
                  </Button>

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

                <p className="mt-4 text-xs text-muted-foreground">
                  If the error persists, check console logs or report the steps
                  to reproduce.
                </p>
              </div>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}
