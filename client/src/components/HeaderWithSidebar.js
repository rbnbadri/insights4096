// HeaderWithSidebar.js
import React, { useState, useRef, useEffect } from "react";
import "./styles/HeaderWithSidebar.css";
import logo from "../logo.png"; // adjust path as needed
import AboutSidebar from "./AboutSidebar";

export default function HeaderWithSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsSidebarOpen(false);
      } else if (
        e.key === "Enter" &&
        document.activeElement === closeBtnRef.current
      ) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
      setTimeout(() => closeBtnRef.current?.focus(), 0);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <>
      <header className="header-bar">
        <div className="header-left">
          <img src={logo} alt="Insights4096 Logo" className="header-logo" />
          <span className="header-title">Insights4096</span>
          <span className="nav-link active">Home</span>
          <span className="nav-link" onClick={() => setIsSidebarOpen(true)}>
            About
          </span>
        </div>
      </header>

      <AboutSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
