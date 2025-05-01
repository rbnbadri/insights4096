import React, { useState, useEffect } from "react";
import "../App.css";
import { FaInfoCircle } from "react-icons/fa";

const RedToastMessage = () => {
  const [toast, setToast] = useState({ message: "", visible: false });

  useEffect(() => {
    const handleRedToast = (e) => {
      setToast({ message: e.detail, visible: true });

      setTimeout(() => {
        setToast({ message: "", visible: false });
      }, 3000);
    };

    window.addEventListener("trigger-red-toast", handleRedToast);
    return () =>
      window.removeEventListener("trigger-red-toast", handleRedToast);
  }, []);

  if (!toast.visible) return null;

  return (
    <div className="toast-base red-toast-message">
      <FaInfoCircle style={{ color: "white", marginRight: "8px" }} />
      <span>{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => setToast({ message: "", visible: false })}
      >
        ✕
      </button>
    </div>
  );
};

export default RedToastMessage;
