import React, { useState, useEffect } from "react";
import "../App.css";
import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";

const ToastMessage = () => {
  const [toast, setToast] = useState({ type: "", message: "", visible: false });

  useEffect(() => {
    const handleGreen = (e) =>
      setToast({ type: "green", message: e.detail, visible: true });

    const handleRed = (e) =>
      setToast({ type: "red", message: e.detail, visible: true });

    const handleLoading = () =>
      setToast({ type: "grey", message: "Loading data...", visible: true });

    const clearLoading = () =>
      setToast((prev) =>
        prev.type === "grey" ? { ...prev, visible: false } : prev,
      );

    window.addEventListener("trigger-green-toast", handleGreen);
    window.addEventListener("trigger-red-toast", handleRed);
    window.addEventListener("trigger-grey-toast-start", handleLoading);
    window.addEventListener("trigger-grey-toast-stop", clearLoading);

    return () => {
      window.removeEventListener("trigger-green-toast", handleGreen);
      window.removeEventListener("trigger-red-toast", handleRed);
      window.removeEventListener("trigger-grey-toast-start", handleLoading);
      window.removeEventListener("trigger-grey-toast-stop", clearLoading);
    };
  }, []);

  useEffect(() => {
    if (toast.visible && toast.type !== "grey") {
      const timer = setTimeout(
        () => setToast({ type: "", message: "", visible: false }),
        3000,
      );
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast.visible) return null;

  const toastClass = `${toast.type}-toast-message`;
  const Icon =
    toast.type === "red"
      ? FaExclamationTriangle
      : ["grey", "green"].includes(toast.type)
        ? FaInfoCircle
        : null;

  const IconColor = toast.type === "grey" ? "#333" : "white";

  return (
    <div className={`toast-base ${toastClass}`}>
      {Icon && <Icon style={{ color: IconColor, marginRight: "8px" }} />}
      <span>{toast.message}</span>
      {toast.type !== "grey" && (
        <button
          className="toast-close"
          onClick={() => setToast({ type: "", message: "", visible: false })}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ToastMessage;
