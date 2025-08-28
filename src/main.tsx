import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";
import './lib/i18n';
import { AuthProvider } from './contexts/AuthContext';
import { JellyfinProvider } from "./contexts/JellyfinContext";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <JellyfinProvider>
          <App />
        </JellyfinProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}