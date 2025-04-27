// src/apiConfig.js

const isReplit = window.location.hostname.includes("replit.dev");

export const BACKEND_URL = isReplit
  ? "https://fc511c5e-ad91-434b-b376-03734aabba98-00-15nynkqgkr4sv.sisko.replit.dev"
  : "https://insights4096-backend.onrender.com";
