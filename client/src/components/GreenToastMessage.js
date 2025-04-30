import React, { useState, useEffect } from "react";
import "../App.css";
import { FaInfoCircle } from "react-icons/fa";

const GreenToastMessage = () => {
  const [toast, setToast] = useState({ message: "", visible: false });

  useEffect(() => {
    const handleGreenToast = (e) => {
      setToast({ message: e.detail, visible: true });

      setTimeout(() => {
        setToast({ message: "", visible: false });
      }, 3000);
    };

    window.addEventListener("trigger-green-toast", handleGreenToast);
    return () =>
      window.removeEventListener("trigger-green-toast", handleGreenToast);
  }, []);

  if (!toast.visible) return null;

  console.log("Received toast message: ", toast.message);
  return (
    <div className="toast-base green-toast-message">
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

export default GreenToastMessage;
