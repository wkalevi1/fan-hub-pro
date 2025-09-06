import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

class DevErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(err, info){ console.error("UI error:", err, info); }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      return (
        <div style={{ padding: 16, color: "#b00", fontFamily: "system-ui" }}>
          <h2>UI error</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(e.stack || e.message || e)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <DevErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </DevErrorBoundary>
  );
}
