import { Component } from "react";
import { ServerErrorPage } from "@/pages/ServerErrorPage";

export class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.VITE_SENTRY_DSN && window.Sentry) {
      window.Sentry.captureException(error, { extra: info });
    }
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
