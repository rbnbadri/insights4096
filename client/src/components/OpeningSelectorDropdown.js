// OpeningSelectorDropdown.js
import React from "react";
import "../App.css";

const OpeningSelectorDropdown = ({ availableOpenings, selectedOpenings, setSelectedOpenings }) => {
  const handleToggle = (name) => {
    if (selectedOpenings.includes(name)) {
      setSelectedOpenings(selectedOpenings.filter((n) => n !== name));
    } else if (selectedOpenings.length < 3) {
      setSelectedOpenings([...selectedOpenings, name]);
    }
  };

  const sortedOpenings = [...availableOpenings].sort((a, b) => {
    const aSel = selectedOpenings.includes(a.name);
    const bSel = selectedOpenings.includes(b.name);
    if (aSel && !bSel) return -1;
    if (!aSel && bSel) return 1;
    return 0;
  });

  return (
    <div className="opening-selector-list">
      {sortedOpenings.map((opening) => (
        <label key={opening.name} className="checkbox-row">
          <input
            type="checkbox"
            checked={selectedOpenings.includes(opening.name)}
            onChange={() => handleToggle(opening.name)}
            disabled={!selectedOpenings.includes(opening.name) && selectedOpenings.length >= 3}
          />
          <span className="opening-label">{opening.name}</span>
        </label>
      ))}
    </div>
  );
};

export default OpeningSelectorDropdown;
