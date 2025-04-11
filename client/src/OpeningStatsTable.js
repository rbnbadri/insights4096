import React, { useState, useMemo } from "react";
import Select, { components } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generateChessComLink } from "./chessLinkUtils";

// Custom multi-value container to limit shown selections
const MultiValue = ({ index, ...props }) => {
  const maxToShow = 3;

  if (index < maxToShow) {
    return <components.MultiValue {...props} />;
  }

  if (index === maxToShow) {
    return (
      <components.MultiValue {...props}>
        <span style={{ padding: "0 4px", fontWeight: "bold" }}>...</span>
      </components.MultiValue>
    );
  }

  return null;
};

const OpeningStatsTable = ({ title, data, totals }) => {
  const [controlOption, setControlOption] = useState("5");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [dateRangeOption, setDateRangeOption] = useState(null);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  const openingOptions = Object.entries(data || {}).map(([ecoName]) => ({
    value: ecoName,
    label: ecoName,
  }));

  const dateRangeOptions = [
    { value: "current-month", label: "Current Month" },
    { value: "last-30", label: "Last 1 Month" },
    { value: "last-60", label: "Last 2 Months" },
    { value: "custom", label: "Custom Range" },
  ];

  const applyFilters = useMemo(() => {
    return selectedOptions.length
      ? Object.entries(data).filter(([ecoName]) =>
          selectedOptions.some((opt) => opt.value === ecoName),
        )
      : Object.entries(data);
  }, [data, selectedOptions]);

  const visibleRows = useMemo(() => {
    const count = parseInt(controlOption);
    return controlOption === "all"
      ? applyFilters
      : applyFilters.slice(0, count);
  }, [applyFilters, controlOption]);

  const totalRows = applyFilters.length;

  const totalStats = useMemo(() => {
    return applyFilters.reduce(
      (acc, [_, val]) => {
        acc.played += val.played;
        acc.won += val.won;
        acc.lost += val.lost;
        acc.drawn += val.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );
  }, [applyFilters]);

  const renderStatLink = (count, ecoUrlString, resultType = null) => {
    if (count > 0) {
      return (
        <a
          href={generateChessComLink(ecoUrlString, resultType)}
          target="_blank"
          rel="noreferrer"
        >
          {count}
        </a>
      );
    }
    return count;
  };

  return (
    <div className="table-wrapper">
      <table className="styled-table">
        <thead>
          <tr className="summary-row">
            <th colSpan="10" className="summary-header">
              <div className="summary-bar-vertical">
                <div className="summary-text">
                  All Games: (P: {totalStats.played}, W: {totalStats.won}, L:{" "}
                  {totalStats.lost}, D: {totalStats.drawn})<br />
                  Showing {visibleRows.length} rows out of {totalRows}
                </div>
                <div className="filter-dropdown">
                  <Select
                    placeholder="Filter Openings"
                    options={openingOptions}
                    value={selectedOptions}
                    isMulti
                    onChange={(options) => setSelectedOptions(options || [])}
                    classNamePrefix="react-select"
                    components={{ MultiValue }}
                  />
                </div>
                <div className="date-range-dropdown">
                  <Select
                    placeholder="Select Date Range"
                    options={dateRangeOptions}
                    value={dateRangeOption}
                    onChange={setDateRangeOption}
                    classNamePrefix="react-select"
                  />
                  {dateRangeOption?.value === "custom" && (
                    <div className="date-picker-range">
                      <DatePicker
                        selected={customStartDate}
                        onChange={(date) => setCustomStartDate(date)}
                        placeholderText="Start Date"
                        maxDate={new Date()}
                        minDate={
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() - 1,
                            ),
                          )
                        }
                      />
                      <DatePicker
                        selected={customEndDate}
                        onChange={(date) => setCustomEndDate(date)}
                        placeholderText="End Date"
                        maxDate={new Date()}
                        minDate={
                          customStartDate ||
                          new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() - 1,
                            ),
                          )
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="summary-controls">
                  <button onClick={() => setControlOption("5")}>Top 5</button>
                  <button onClick={() => setControlOption("10")}>Top 10</button>
                  <button onClick={() => setControlOption("all")}>
                    Show All
                  </button>
                  <button onClick={() => setSelectedOptions([])}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </th>
          </tr>
          <tr>
            <th>Opening Name</th>
            <th>Opening Name with Eco</th>
            <th>Played</th>
            <th>Won</th>
            <th>Lost</th>
            <th>Drawn</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map(([ecoName, stats], idx) => (
            <tr key={idx}>
              <td>{ecoName}</td>
              <td>{stats.ecoCode}</td>
              <td>{renderStatLink(stats.played, stats.ecoUrlString)}</td>
              <td>{renderStatLink(stats.won, stats.ecoUrlString, "win")}</td>
              <td>{renderStatLink(stats.lost, stats.ecoUrlString, "lost")}</td>
              <td>{renderStatLink(stats.drawn, stats.ecoUrlString, "draw")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OpeningStatsTable;
