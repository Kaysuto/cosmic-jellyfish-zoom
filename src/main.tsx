import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";
import { waitForI18n } from './lib/i18n';
import { AuthProvider } from './contexts/AuthContext';
import { JellyfinProvider } from "./contexts/JellyfinContext";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);
  
  // Attendre l'initialisation d'i18n avant de rendre l'application
  waitForI18n().then(() => {
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <JellyfinProvider>
            <App />
          </JellyfinProvider>
        </AuthProvider>
      </React.StrictMode>
    );
  }).catch((error) => {
    console.error('Erreur lors de l\'initialisation:', error);
    // Rendre quand même l'application en cas d'erreur
    root.render(
      <React.StrictMode>
        <AuthProvider>
          <JellyfinProvider>
            <App />
          </JellyfinProvider>
        </AuthProvider>
      </React.StrictMode>
    );
  });
}