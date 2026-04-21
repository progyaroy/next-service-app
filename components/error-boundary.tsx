"use client";

import React, { ReactNode, ReactElement } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching React errors
 * Prevents entire app from crashing on component errors
 * Allows Next.js redirects and navigation errors to pass through
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Don't catch Next.js redirect errors
    if (isNextRedirectError(error)) {
      throw error;
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Don't log redirect errors
    if (isNextRedirectError(error)) {
      throw error;
    }
    // Log to error tracking service in production
    console.error("Error caught by boundary:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.reset)
      ) : (
        <DefaultErrorFallback error={this.state.error} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

/**
 * Check if error is a Next.js redirect error
 */
function isNextRedirectError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.message === "NEXT_REDIRECT" ||
    error.message.includes("NEXT_REDIRECT") ||
    (error as any).digest?.includes("NEXT_REDIRECT")
  );
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Something went wrong
        </h1>
        <p className="mb-4 text-gray-600">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex gap-4">
          <button
            onClick={reset}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="flex-1 rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
