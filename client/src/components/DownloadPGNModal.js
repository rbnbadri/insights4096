// DownloadPGNModal.js
import React, { useState, useEffect } from "react";
import OpeningSelectorDropdown from "./OpeningSelectorDropdown";
import Select from "react-select";
import "../App.css";

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

  useEffect(() => {
    if (isOpen) {
      setSelectedColor(color);
      setSelectedOpenings([]);
      setSelectedResults([]);
    }
  }, [isOpen, color]);

  const handleDownload = () => {
    if (!selectedOpenings.length || !selectedResults.length) {
      alert("Please select at least one opening and one result type.");
      return;
    }
    onDownload({ selectedColor, selectedOpenings, selectedResults, startDate, endDate });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="download-modal">
        <div className="modal-header">
          <h2 className="modal-header-text">Download PGNs</h2>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="modal-label">Color</label>
            <div className="radio-group">
              <label>
                <input type="radio" value="white" checked={selectedColor === "white"} onChange={() => setSelectedColor("white")} /> White
              </label>
              <label style={{ marginLeft: "20px" }}>
                <input type="radio" value="black" checked={selectedColor === "black"} onChange={() => setSelectedColor("black")} /> Black
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="modal-label">Opening Variations</label>
            <OpeningSelectorDropdown
              availableOpenings={availableOpenings}
              selectedOpenings={selectedOpenings}
              setSelectedOpenings={setSelectedOpenings}
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
              value={selectedResults.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
              onChange={(opts) => setSelectedResults(opts.map((o) => o.value))}
            />
          </div>

          <div className="form-group">
            <label className="modal-label">Date Range</label>
            <div className="date-range-display">
              <input type="text" value={startDate} readOnly />
              <input type="text" value={endDate} readOnly style={{ marginLeft: "10px" }} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleDownload}>Download</button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPGNModal;
