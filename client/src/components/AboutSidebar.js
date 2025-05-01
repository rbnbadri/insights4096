import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { FaTimes } from "react-icons/fa";
import "./styles/AboutSidebar.css";

const AboutSidebar = ({ isOpen, onClose }) => {
  const [markdown, setMarkdown] = useState("");
  const sidebarRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/content/about.md")
        .then((res) => res.text())
        .then(setMarkdown);

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          onClose();
        } else if (
          e.key === "Enter" &&
          document.activeElement === closeBtnRef.current
        ) {
          onClose();
        }
      };

      const handleOutsideClick = (e) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
          onClose();
        }
      };

      setTimeout(() => closeBtnRef.current?.focus(), 0);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleOutsideClick);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <aside className="about-sidebar" ref={sidebarRef}>
      <div className="about-header">
        <span className="about-title">ABOUT THIS SITE</span>
        <button
          className="about-close"
          onClick={onClose}
          ref={closeBtnRef}
          aria-label="Close About Sidebar"
        >
          <FaTimes size={22} />
        </button>
      </div>
      <div className="about-content">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </div>
    </aside>
  );
};

export default AboutSidebar;
