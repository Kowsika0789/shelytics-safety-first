import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface the full component stack in the console to identify the culprit.
    // eslint-disable-next-line no-console
    console.error("App crashed:", error);
    // eslint-disable-next-line no-console
    console.error("Component stack:", info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-svh bg-background text-foreground">
          <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center px-6 py-10">
            <h1 className="text-balance text-2xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Open the browser console to see the component stack for this crash.
            </p>
            <pre className="mt-6 overflow-auto rounded-md border bg-muted p-4 text-xs">
              {this.state.error.message}
            </pre>
            <div className="mt-6 flex gap-3">
              <button
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                onClick={() => window.location.reload()}
                type="button"
              >
                Reload
              </button>
              <button
                className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm"
                onClick={() => this.setState({ error: null })}
                type="button"
              >
                Try again
              </button>
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}
