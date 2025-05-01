// DownloadPGNModal.js
import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import OpeningSelectorDropdown from "./OpeningSelectorDropdown";
import Select, { components } from "react-select";
import "../App.css";
import { triggerGreenToast } from "../utils/toast";
import "./styles/DownloadPGNModal.css";

const DownloadPGNModal = ({
  isOpen,
  onClose,
  color,
  startDate,
  endDate,
  availableOpenings,
  onDownload,
}) => {
  const [selectedColor, setSelectedColor] = useState(color);
  const [selectedOpenings, setSelectedOpenings] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [error, setError] = useState("");

  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (
        e.key === "Enter" &&
        document.activeElement === closeButtonRef.current
      ) {
        onClose();
      }
    };

    if (isOpen) {
      setSelectedColor(color);
      setSelectedOpenings([]);
      setSelectedResults([]);

      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, color, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(color);
      setSelectedOpenings([]);
      setSelectedResults([]);
    }
  }, [isOpen, color]);

  const clearError = () => {
    setError("");
  };

  const handleDownload = async () => {
    if (!selectedOpenings.length) {
      setError("Please select at least one Opening Variation.");
      return;
    }

    setError("");

    await onDownload({
      selectedColor,
      selectedOpenings,
      selectedResults,
      startDate,
      endDate,
    });

    closeButtonRef.current?.focus(); // No timeout needed now
  };

  const handleCheckboxChange = (opts) => {
    const newSelections = opts.map((o) => o.value);

    if (newSelections.length === 3) {
      setSelectedResults([]);
      triggerGreenToast("All games will be downloaded.");
    } else {
      setSelectedResults(newSelections);
    }
  };

  const handleColorChange = (newColor) => {
    setSelectedColor(newColor);
    setSelectedOpenings([]);
    setSelectedResults([]);
  };

  if (!isOpen) return null;
  const testId = "Results Filter";

  const CustomControl = ({ children, innerRef, innerProps, ...rest }) => (
    <components.Control
      {...rest}
      innerRef={innerRef}
      innerProps={{ ...innerProps, "data-test-id": testId }}
    >
      {children}
    </components.Control>
  );

  const filteredAvailableOpenings = availableOpenings[selectedColor] || [];

  return (
    <div className="modal-overlay">
      <div className="download-modal">
        <div className="modal-header">
          <h2 className="modal-header-text">Download PGNs</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close Modal"
            ref={closeButtonRef}
          >
            <FaTimes color="white" size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="modal-label">Color</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="white"
                  checked={selectedColor === "white"}
                  onChange={() => handleColorChange("white")}
                />{" "}
                White
              </label>
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="radio"
                  value="black"
                  checked={selectedColor === "black"}
                  onChange={() => handleColorChange("black")}
                />{" "}
                Black
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="modal-label-with-count">
              <label className="modal-label">
                Opening Variations (maximum 3)
                <span className="required-asterisk">*</span>
              </label>
              {selectedOpenings.length > 0 && (
                <span className="openings-count">
                  {selectedOpenings.length} opening
                  {selectedOpenings.length > 1 ? "s" : ""} selected
                </span>
              )}
            </div>
            <OpeningSelectorDropdown
              availableOpenings={filteredAvailableOpenings}
              selectedOpenings={selectedOpenings}
              setSelectedOpenings={setSelectedOpenings}
              clearError={clearError}
            />
          </div>

          <div className="form-group">
            <label className="modal-label">Results</label>
            <Select
              isMulti
              options={[
                { value: "win", label: "Win" },
                { value: "lost", label: "Lost" },
                { value: "drawn", label: "Drawn" },
              ]}
              classNamePrefix="react-select"
              components={{ Control: CustomControl }}
              value={selectedResults.map((r) => ({
                value: r,
                label: r.charAt(0).toUpperCase() + r.slice(1),
              }))}
              onChange={(opts) => handleCheckboxChange(opts)}
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>

          <div className="form-group">
            <label className="modal-label">Date Range</label>
            <div className="date-range-display">
              <div className="date-field">
                <label className="date-label">Start Date</label>
                <input type="text" value={startDate} readOnly />
              </div>
              <div className="date-field">
                <label className="date-label">End Date</label>
                <input type="text" value={endDate} readOnly />
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          {error && (
            <div className="red-text">
              <FaExclamationTriangle className="red-icon" /> {error}
            </div>
          )}
          <button
            className="btn-cancel"
            onClick={() => {
              setSelectedOpenings([]);
              setSelectedResults([]);
              setError("");
              onClose();
            }}
          >
            Cancel
          </button>
          <button className="btn-primary" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPGNModal;
