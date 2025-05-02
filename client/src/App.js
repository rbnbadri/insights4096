import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import OpeningStatsSection from "./OpeningStatsSection";
import logo from "./logo.png";
import useOpeningState from "./hooks/useOpeningState";
import GreenToastMessage from "./components/GreenToastMessage";
import RedToastMessage from "./components/RedToastMessage";
import HeaderWithSidebar from "./components/HeaderWithSidebar";

function Insights4096() {
  const [username, setUsername] = useState("");
  const [isOwnUsername, setIsOwnUsername] = useState(true);

  const usernameRef = useRef(null);

  useEffect(() => {
    if (usernameRef.current && username.trim().length === 0) {
      usernameRef.current.focus();
    }
  }, [username]);

  const handleChange = (e) => setUsername(e.target.value);

  const {
    filteredData,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    submitted,
    loadingState,
    resetToDefaultRange,
    fullResetTrigger,
    setFullResetTrigger,
    expandedTable,
    setExpandedTable,
    selectedColor,
    setSelectedColor,
    selectedOptions,
    setSelectedOptions,
    showingFilteredSummary,
    setShowingFilteredSummary,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    handleSubmit,
    handleResetToCachedOneMonth,
    handleSearchClick,
    setIsDefaultLoad,
  } = useOpeningState(username);

  const renderTable = (color, summaryLabel) => {
    const enteredUsername = isOwnUsername ? null : username;
    return submitted && filteredData?.[color] ? (
      <div className="table-section">
        <OpeningStatsSection
          data={{
            ...filteredData,
            startDate,
            endDate,
          }}
          color={color}
          summaryLabel={summaryLabel}
          testId={`Openings filter- ${color}`}
          loading={loadingState[color]}
          resetToDefaultRange={resetToDefaultRange}
          fullResetTrigger={fullResetTrigger}
          expandedTable={expandedTable}
          setExpandedTable={setExpandedTable}
          onResetToCachedOneMonth={() => handleResetToCachedOneMonth()}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            handleSubmit(start, end, color, false, "fetch_with_date_range");
          }}
          isOwnUsername={isOwnUsername}
          enteredUsername={enteredUsername}
          username={username}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          showingFilteredSummary={showingFilteredSummary}
          setShowingFilteredSummary={setShowingFilteredSummary}
          sortColumn={sortColumn}
          setSortColumn={setSortColumn}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
        />
      </div>
    ) : submitted ? (
      <p>No {color} games found.</p>
    ) : null;
  };

  return (
    <div className="App">
      <GreenToastMessage />
      <RedToastMessage />
      <HeaderWithSidebar />
      <div className="page-title-container">
        <img src={logo} alt="Logo" className="logo" />
        <div className="title-and-input">
          <h2 className="section-title">Chess Insights v1.0.0</h2>
          <div className="flex-row">
            <div className="username-input-wrapper">
              <input
                type="text"
                ref={usernameRef}
                value={username}
                onChange={handleChange}
                placeholder="Enter ChessDotCom username"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setIsDefaultLoad(true);
                    handleSearchClick();
                  }
                }}
              />
              {username.length > 0 && (
                <button
                  className="clear-username"
                  onClick={() => setUsername("")}
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setIsDefaultLoad(true);
                handleSearchClick();
              }}
            >
              Search
            </button>
            <label>
              <input
                type="checkbox"
                checked={isOwnUsername}
                onChange={(e) => setIsOwnUsername(e.target.checked)}
                style={{ marginLeft: "10px", marginRight: "4px" }}
              />
              This is my username
            </label>
          </div>
        </div>
      </div>

      {submitted && (
        <div className="color-toggle-buttons">
          {["white", "black"].map((color) => (
            <button
              key={color}
              className={selectedColor === color ? "active" : ""}
              onClick={() => {
                setSelectedColor(color);
                setSelectedOptions([]); // ✅ Reset filters
                setShowingFilteredSummary(false);
                setSortColumn("played");
                setSortDirection("desc");

                // ✅ Trigger full reset so OpeningStatsSection clears filters
                setFullResetTrigger(true);
                setTimeout(() => setFullResetTrigger(false), 100);

                // ✅ Retain current date range for the new color
                if (filteredData?.startDate && filteredData?.endDate) {
                  handleSubmit(
                    filteredData.startDate,
                    filteredData.endDate,
                    color,
                  );
                }
              }}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>
      )}

      {renderTable(
        selectedColor,
        `${selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)} Games`,
      )}
    </div>
  );
}

export default Insights4096;
