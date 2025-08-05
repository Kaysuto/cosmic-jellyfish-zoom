import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import './lib/i18n';

createRoot(document.getElementById("root")!).render(<App />);