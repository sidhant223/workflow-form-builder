// src/components/ErrorBoundary.jsx
// Catches render errors anywhere below it in the tree and shows a fallback
// UI instead of a blank white screen. Error boundaries must be class
// components — React has no hook equivalent for getDerivedStateFromError.

import { Component } from "react";
import Button from "./ui/button";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled application error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong.</h1>
          <p className="text-gray-600">Please refresh the application.</p>
          <Button onClick={this.handleReload}>Reload</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
