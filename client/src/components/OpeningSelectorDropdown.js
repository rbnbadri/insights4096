// OpeningSelectorDropdown.js
import React, { useState, useEffect, useRef } from "react";
import "../App.css";

const OpeningSelectorDropdown = ({
  availableOpenings,
  selectedOpenings,
  setSelectedOpenings,
  clearError,
}) => {
  const [searchText, setSearchText] = useState("");
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleToggle = (name) => {
    clearError();
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

  const filteredOpenings = sortedOpenings.filter((opening) =>
    opening.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="opening-selector-list">
      <div className="search-container">
        <input
          type="text"
          ref={searchInputRef}
          className="opening-search"
          placeholder="Search openings..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        {searchText && (
          <button
            className="clear-search-button"
            onClick={() => setSearchText("")}
          >
            &#10005;
          </button>
        )}
      </div>

      {filteredOpenings.length > 0 ? (
        filteredOpenings.map((opening) => (
          <label key={opening.name} className="checkbox-row">
            <input
              type="checkbox"
              checked={selectedOpenings.includes(opening.name)}
              onChange={() => handleToggle(opening.name)}
              disabled={
                !selectedOpenings.includes(opening.name) &&
                selectedOpenings.length >= 3
              }
            />
            <span className="opening-label">{opening.name}</span>
          </label>
        ))
      ) : (
        <div className="no-openings-found">No Openings Found</div>
      )}
    </div>
  );
};

export default OpeningSelectorDropdown;
