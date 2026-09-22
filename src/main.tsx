import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { seedSampleData } from "./sampleData.ts";

// Seed sample data on first load
seedSampleData();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
