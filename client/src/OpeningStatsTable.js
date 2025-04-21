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
  color = null,
  summaryLabel = "All Games",
  testId = "Openings filter",
}) => {
  const [sortColumn, setSortColumn] = useState("played");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [viewLimit, setViewLimit] = useState(5);
  const [showingFilteredSummary, setShowingFilteredSummary] = useState(false);
  const [dateRangeOption, setDateRangeOption] = useState("last-30");

  useEffect(() => {
    if (resetToDefaultRange) {
      setDateRangeOption("last-30");
    }
  }, [resetToDefaultRange]);

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
    const entries = Object.entries(data).filter(
      ([k]) => !["startDate", "endDate"].includes(k),
    );
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
      const baseLink = generateChessComLink(ecoUrlString, resultType, color);
      const dateQuery = `&endDate%5Bdate%5D=${encodeURIComponent(endFormatted)}&startDate%5Bdate%5D=${encodeURIComponent(startFormatted)}`;
      return (
        <a href={baseLink + dateQuery} target="_blank" rel="noreferrer">
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

  const totalRows = selectedOptions.length
    ? selectedOptions.length
    : Object.entries(data).filter(
        ([key]) => !["startDate", "endDate"].includes(key),
      ).length;

  const visibleRows = Object.keys(filteredEntries).length;

  return (
    <div>
      {/* Toolbar section placed outside the table */}
      <div className="summary-bar-vertical">
        <div className="summary-text">
          {showingFilteredSummary ? (
            <>
              Filtered {summaryLabel}: (P: {filteredSummary.played}, W:{" "}
              {filteredSummary.won}, L: {filteredSummary.lost}, D:{" "}
              {filteredSummary.drawn})<br />
              {summaryLabel}: (P: {fullSummary.played}, W: {fullSummary.won}, L:{" "}
              {fullSummary.lost}, D: {fullSummary.drawn})<br />
            </>
          ) : (
            <>
              {summaryLabel}: (P: {fullSummary.played}, W: {fullSummary.won}, L:{" "}
              {fullSummary.lost}, D: {fullSummary.drawn})<br />
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
                ["select-option", "remove-value"].includes(actionMeta.action)
              ) {
                setShowingFilteredSummary(true);
              } else if (actionMeta.action === "clear") {
                setShowingFilteredSummary(false);
              }
              setSelectedOptions(newOptions || []);
            }}
            classNamePrefix="react-select"
            components={{ MultiValue }}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "30px",
                fontSize: "12px",
              }),
            }}
            data-test-id={testId}
          />
        </div>

        <div className="date-range-dropdown">
          <DateRangeSelector
            onDateRangeResolved={onDateRangeChange}
            dateRangeOption={dateRangeOption}
            setDateRangeOption={setDateRangeOption}
            testId={`date range selector - ${color || "all"}`}
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

      {/* Table section */}
      <div className="table-wrapper" style={{ position: "relative" }}>
        {loading && <div className="loading-overlay">Loading data...</div>}
        <table className="chess-table" style={{ opacity: loading ? 0.5 : 1 }}>
          <thead>
            <tr data-test-id={`Table header for ${color || "all"} openings`}>
              <th className="sortable" onClick={() => setSortColumn("name")}>
                Opening Name{renderSortIndicator("name")}
              </th>
              <th>Opening Name with Eco</th>
              <th className="sortable" onClick={() => setSortColumn("played")}>
                Played{renderSortIndicator("played")}
              </th>
              <th className="sortable" onClick={() => setSortColumn("won")}>
                Won{renderSortIndicator("won")}
              </th>
              <th className="sortable" onClick={() => setSortColumn("lost")}>
                Lost{renderSortIndicator("lost")}
              </th>
              <th className="sortable" onClick={() => setSortColumn("drawn")}>
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
