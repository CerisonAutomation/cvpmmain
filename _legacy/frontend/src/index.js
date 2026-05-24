import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn && typeof window !== "undefined") {
  window.Sentry = window.Sentry || {
    captureException: (err) => console.error("[Sentry]", err),
  };
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        // Check for updates
        setInterval(() => registration.update(), 60000);
      })
      .catch(() => {});
  });
}

// PWA Install prompt handler
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Dispatch custom event for app to show install UI
  window.dispatchEvent(new CustomEvent('pwa-installable'));
});

// Expose install function globally
window.installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      deferredPrompt = null;
    });
  }
};
