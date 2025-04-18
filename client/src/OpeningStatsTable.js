// OpeningStatsTable.js with testing identifiers added

import React, { useEffect, useState, useMemo } from "react";
import Select, { components } from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { generateChessComLink } from "./chessLinkUtils";
import DateRangeSelector from "./DateRangeSelector";

const OpeningStatsTable = ({
  data = {},
  onDateRangeChange,
  loading,
  onResetToCachedOneMonth,
  resetToDefaultRange,
  fullResetTrigger,
  testId = "Openings filter",
}) => {
  const [sortColumn, setSortColumn] = useState("played");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [viewLimit, setViewLimit] = useState(5);
  const [showingFilteredSummary, setShowingFilteredSummary] = useState(false);
  const [dateRangeOption, setDateRangeOption] = useState("last-30");

  const CustomControl = ({ children, innerRef, innerProps, ...rest }) => (
    <components.Control
      {...rest}
      innerRef={innerRef}
      innerProps={{ ...innerProps, "data-test-id": testId }}
    >
      {children}
    </components.Control>
  );

  useEffect(() => {
    if (resetToDefaultRange) {
      setDateRangeOption("last-30");
    }
  }, [resetToDefaultRange]);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    if (data) {
      const sortedOptions = Object.entries(data)
        .filter(([key]) => !["startDate", "endDate"].includes(key))
        .sort(([, a], [, b]) => b.played - a.played)
        .map(([key, val]) => ({
          value: key,
          label: val.ecoCode || key,
        }));
      setFilterOptions(sortedOptions);
    }
  }, [data]);

  useEffect(() => {
    if (fullResetTrigger) {
      setSelectedOptions([]);
      setViewLimit(5);
      setShowingFilteredSummary(false);
    }
  }, [fullResetTrigger]);

  const filteredEntries = useMemo(() => {
    const entries = Object.entries(data);
    const filtered = selectedOptions.length
      ? entries.filter(([name]) =>
          selectedOptions.some((opt) => opt.value === name),
        )
      : entries;

    const sorted = filtered.sort(([_, a], [__, b]) => {
      const order = sortOrder === "asc" ? 1 : -1;
      return (a[sortColumn] - b[sortColumn]) * order;
    });

    return Object.fromEntries(sorted.slice(0, viewLimit));
  }, [data, selectedOptions, sortColumn, sortOrder, viewLimit]);

  const clearFilters = () => {
    setSelectedOptions([]);
    setViewLimit(5);
  };

  const fullSummary = useMemo(() => {
    return Object.entries(data).reduce(
      (acc, [key, val]) => {
        if (["startDate", "endDate"].includes(key)) return acc;
        acc.played += val.played;
        acc.won += val.won;
        acc.lost += val.lost;
        acc.drawn += val.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );
  }, [data]);

  const filteredSummary = useMemo(() => {
    return Object.entries(filteredEntries).reduce(
      (acc, [_, val]) => {
        acc.played += val.played;
        acc.won += val.won;
        acc.lost += val.lost;
        acc.drawn += val.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );
  }, [filteredEntries]);

  const totalRows =
    selectedOptions.length > 0
      ? selectedOptions.length
      : Object.entries(data).filter(
          ([key]) => !["startDate", "endDate"].includes(key),
        ).length;

  const visibleRows = Object.keys(filteredEntries).length;

  const MultiValue = ({ index, getValue, ...props }) => {
    const maxToShow = 3;
    if (index < maxToShow) return <components.MultiValue {...props} />;
    if (index === maxToShow) {
      return (
        <components.MultiValue {...props}>
          <span style={{ paddingLeft: "4px" }}>...</span>
        </components.MultiValue>
      );
    }
    return null;
  };

  const renderLinkedCell = (count, resultType, ecoUrlString) => {
    if (count > 0 && data.startDate && data.endDate) {
      const startFormatted = new Date(data.startDate).toLocaleDateString(
        "en-US",
      );
      const endFormatted = new Date(data.endDate).toLocaleDateString("en-US");

      const baseLink = generateChessComLink(ecoUrlString, resultType);
      const dateQuery = `&endDate%5Bdate%5D=${encodeURIComponent(endFormatted)}&startDate%5Bdate%5D=${encodeURIComponent(startFormatted)}`;
      const fullLink = baseLink + dateQuery;

      return (
        <a href={fullLink} target="_blank" rel="noreferrer">
          {count}
        </a>
      );
    }
    return count;
  };

  const renderSortIndicator = (column) => {
    if (column !== sortColumn) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div>
      <div className="table-wrapper" style={{ position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "12px 20px",
              borderRadius: "6px",
              fontWeight: "bold",
              boxShadow: "0 0 6px rgba(0,0,0,0.1)",
              zIndex: 10,
            }}
          >
            Loading data...
          </div>
        )}
        <table className="chess-table" style={{ opacity: loading ? 0.5 : 1 }}>
          <thead>
            <tr className="summary-row">
              <th colSpan="10">
                <div className="summary-bar-vertical">
                  <div className="summary-text">
                    {showingFilteredSummary ? (
                      <>
                        Filtered Games: (P: {filteredSummary.played}, W:{" "}
                        {filteredSummary.won}, L: {filteredSummary.lost}, D:{" "}
                        {filteredSummary.drawn})<br /> All Games: (P:{" "}
                        {fullSummary.played}, W: {fullSummary.won}, L:{" "}
                        {fullSummary.lost}, D: {fullSummary.drawn})<br />
                      </>
                    ) : (
                      <>
                        All Games: (P: {fullSummary.played}, W:{" "}
                        {fullSummary.won}, L: {fullSummary.lost}, D:{" "}
                        {fullSummary.drawn})<br />
                      </>
                    )}
                    Showing {visibleRows} rows out of {totalRows}
                  </div>
                  <div className="filter-dropdown">
                    <Select
                      options={filterOptions}
                      isMulti
                      placeholder="Filter openings"
                      value={selectedOptions}
                      onChange={(newOptions, actionMeta) => {
                        if (
                          actionMeta.action === "select-option" ||
                          actionMeta.action === "remove-value"
                        ) {
                          setShowingFilteredSummary(true);
                        } else if (actionMeta.action === "clear") {
                          setShowingFilteredSummary(false);
                        }
                        setSelectedOptions(newOptions || []);
                      }}
                      classNamePrefix="react-select"
                      components={{ MultiValue, Control: CustomControl }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "30px",
                          fontSize: "12px",
                        }),
                      }}
                    />
                  </div>
                  <div className="date-range-dropdown">
                    <DateRangeSelector
                      onDateRangeResolved={onDateRangeChange}
                      dateRangeOption={dateRangeOption}
                      setDateRangeOption={setDateRangeOption}
                      testId="Date range selector - both"
                    />
                  </div>
                  <div className="summary-buttons">
                    <button
                      onClick={() => {
                        setViewLimit(5);
                        setShowingFilteredSummary(true);
                      }}
                    >
                      Show 5
                    </button>
                    <button
                      onClick={() => {
                        setViewLimit(10);
                        setShowingFilteredSummary(true);
                      }}
                    >
                      Show 10
                    </button>
                    <button
                      onClick={() => {
                        setViewLimit(totalRows);
                        setShowingFilteredSummary(selectedOptions.length > 0);
                      }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => {
                        clearFilters();
                        if (onResetToCachedOneMonth) onResetToCachedOneMonth();
                        setShowingFilteredSummary(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </th>
            </tr>
            <tr data-test-id="Table header for both openings">
              <th className="sortable" onClick={() => handleSort("name")}>
                Opening Name{renderSortIndicator("name")}
              </th>
              <th>Opening Name with Eco</th>
              <th className="sortable" onClick={() => handleSort("played")}>
                Played{renderSortIndicator("played")}
              </th>
              <th className="sortable" onClick={() => handleSort("won")}>
                Won{renderSortIndicator("won")}
              </th>
              <th className="sortable" onClick={() => handleSort("lost")}>
                Lost{renderSortIndicator("lost")}
              </th>
              <th className="sortable" onClick={() => handleSort("drawn")}>
                Drawn{renderSortIndicator("drawn")}
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(filteredEntries).map(([name, stats]) => (
              <tr key={name} data-test-id="Chess data row">
                <td>{name}</td>
                <td>
                  <a href={stats.ecoUrl} target="_blank" rel="noreferrer">
                    {stats.ecoCode}
                  </a>
                </td>
                <td>
                  {renderLinkedCell(stats.played, null, stats.ecoUrlString)}
                </td>
                <td>
                  {renderLinkedCell(stats.won, "win", stats.ecoUrlString)}
                </td>
                <td>
                  {renderLinkedCell(stats.lost, "lost", stats.ecoUrlString)}
                </td>
                <td>
                  {renderLinkedCell(stats.drawn, "draw", stats.ecoUrlString)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OpeningStatsTable;
