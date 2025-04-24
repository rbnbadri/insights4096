import React, { useState, useEffect } from "react";
import "./App.css";
import OpeningStatsTable from "./OpeningStatsTable";
import logo from "./logo.png";
import { fetchOpenings } from "./api/fetchOpenings";
import useOpeningState from "./hooks/useOpeningState";

function Insights4096() {
  const [username, setUsername] = useState("");
  const [isOwnUsername, setIsOwnUsername] = useState(true);

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
    setResetToDefaultRange,
  } = useOpeningState(username);

  const renderTable = (color, summaryLabel) => {
    const enteredUsername = isOwnUsername ? null : username;
    return submitted && filteredData?.[color] ? (
      <div className="table-section">
        <OpeningStatsTable
          data={{
            ...filteredData[color],
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
          onResetToCachedOneMonth={() => handleResetToCachedOneMonth(color)}
          onDateRangeChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
            handleSubmit(start, end, color);
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
      <div className="header-with-logo">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="header">Chess Insights v0.8.5</h1>
      </div>

      <div className="flex-row">
        <input
          type="text"
          value={username}
          onChange={handleChange}
          placeholder="Enter ChessDotCom username"
        />
        <button
          onClick={() => {
            const today = new Date();
            const oneMonthAgo = new Date(today);
            oneMonthAgo.setDate(today.getDate() - 30);
            const defaultStart = oneMonthAgo.toISOString().split("T")[0];
            const defaultEnd = today.toISOString().split("T")[0];

            setStartDate(defaultStart);
            setEndDate(defaultEnd);

            setResetToDefaultRange(true);
            setFullResetTrigger(true);
            setTimeout(() => {
              setResetToDefaultRange(false);
              setFullResetTrigger(false);
            }, 100);

            handleSubmit(defaultStart, defaultEnd, selectedColor);
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

                // ✅ Trigger full reset so OpeningStatsTable clears filters
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
