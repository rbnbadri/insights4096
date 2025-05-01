// HeaderWithSidebar.js
import React, { useState, useRef, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./HeaderWithSidebar.css";
import logo from "../logo.png"; // adjust path as needed

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
          <span className="header-title">INSIGHTS4096</span>
        </div>
        <div className="header-right">
          <span className="nav-link active">HOME</span>
          <span className="nav-link" onClick={() => setIsSidebarOpen(true)}>
            ABOUT
          </span>
        </div>
      </header>

      {isSidebarOpen && (
        <aside className="about-sidebar">
          <div className="about-header">
            <span className="about-title">ABOUT THIS SITE</span>
            <button
              className="about-close"
              onClick={() => setIsSidebarOpen(false)}
              ref={closeBtnRef}
              aria-label="Close About Sidebar"
            >
              <FaTimes size={22} />
            </button>
          </div>
          <div className="about-content">
            <p>
              <strong>Full description of the site</strong>
            </p>
            <p>
              Including the various options, what can be done with the data and
              so on.
            </p>
            <p>
              This sidebar should close on Esc key, or Enter when ❌ is focused.
            </p>
          </div>
        </aside>
      )}
    </>
  );
}
