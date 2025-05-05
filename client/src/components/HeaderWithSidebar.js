// HeaderWithSidebar.js
import React, { useState, useRef, useEffect } from "react";
import "./styles/HeaderWithSidebar.css";
import logo from "../logo.png"; // adjust path as needed
import AboutSidebar from "./AboutSidebar";

export default function HeaderWithSidebar({
  username,
  setUsername,
  handleSearchClick,
  setIsDefaultLoad,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeBtnRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current && username.trim().length === 0) {
      searchInputRef.current.focus();
    }
  }, [username]);

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

          <div className="header-search">
            <input
              type="text"
              ref={searchInputRef}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter ChessDotCom username"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsDefaultLoad(true);
                  handleSearchClick();
                }
              }}
              autoFocus
            />
            {username.length > 0 && (
              <button
                className="clear-username"
                onClick={() => setUsername("")}
                aria-label="Clear username"
              >
                ×
              </button>
            )}
            <button
              onClick={() => {
                setIsDefaultLoad(true);
                handleSearchClick();
              }}
            >
              Search
            </button>
          </div>
        </div>
      </header>

      <AboutSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
