import React, { useState, useEffect } from "react";
import "./App.css";
import OpeningStatsTable from "./OpeningStatsTable";
import logo from "./logo.png";

function Insights4096() {
  const [username, setUsername] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loadingState, setLoadingState] = useState({
    white: false,
    black: false,
    both: false,
  });

  const [cachedOneMonthWhite, setCachedOneMonthWhite] = useState(null);
  const [cachedOneMonthBlack, setCachedOneMonthBlack] = useState(null);
  const [cachedOneMonthBoth, setCachedOneMonthBoth] = useState(null);

  const [resetToDefaultRange, setResetToDefaultRange] = useState(false);
  const [fullResetTrigger, setFullResetTrigger] = useState(false);
  const [expandedTable, setExpandedTable] = useState(null);
  const [isOwnUsername, setIsOwnUsername] = useState(true);

  useEffect(() => {
    document.title = "Insights4096";

    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    setStartDate(oneMonthAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const handleChange = (e) => setUsername(e.target.value);

  const handleSubmit = async (start = startDate, end = endDate, section) => {
    if (!username) return;

    setLoadingState((prev) => ({ ...prev, [section]: true }));
    const baseUrl = `https://insights4096-backend.onrender.com/openings/${username}`;
    const url = start && end ? `${baseUrl}?start=${start}&end=${end}` : baseUrl;

    try {
      const response = await fetch(url);
      const result = await response.json();
      const gamedata = result.data;

      setFilteredData({
        white: gamedata.white,
        black: gamedata.black,
        both: gamedata.both,
        startDate: start,
        endDate: end,
      });

      const today = new Date();
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setDate(today.getDate() - 30);
      const defaultStart = oneMonthAgo.toISOString().split("T")[0];
      const defaultEnd = today.toISOString().split("T")[0];

      if (start === defaultStart && end === defaultEnd) {
        if (gamedata.white)
          setCachedOneMonthWhite({ data: gamedata.white, startDate, endDate });
        if (gamedata.black)
          setCachedOneMonthBlack({ data: gamedata.black, startDate, endDate });
        if (gamedata.both)
          setCachedOneMonthBoth({ data: gamedata.both, startDate, endDate });
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingState((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleResetToCachedOneMonth = (color) => {
    const cache =
      color === "white"
        ? cachedOneMonthWhite
        : color === "black"
          ? cachedOneMonthBlack
          : cachedOneMonthBoth;

    if (cache) {
      setFilteredData((prev) => ({
        ...prev,
        [color]: cache.data,
      }));
      setStartDate(cache.startDate);
      setEndDate(cache.endDate);
      setSubmitted(true);
      setResetToDefaultRange(true);
      setTimeout(() => setResetToDefaultRange(false), 100);
    }
  };

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
        <h1 className="header">Chess Insights v0.8.2</h1>
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

            handleSubmit(defaultStart, defaultEnd);
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

      {renderTable("white", "White Games")}
      {renderTable("black", "Black Games")}
      {renderTable("both", "All Games")}
    </div>
  );
}

export default Insights4096;
