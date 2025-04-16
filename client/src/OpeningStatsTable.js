import React, { useEffect, useState, useMemo } from "react";
import Select, { components } from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { generateChessComLink } from "./chessLinkUtils";
import DateRangeSelector from "./DateRangeSelector";

const OpeningStatsTable = ({
  data = {},
  title = "All Games",
  totals = {},
  onDateRangeChange,
}) => {
  const [sortColumn, setSortColumn] = useState("played");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [viewLimit, setViewLimit] = useState(5);

  const [dateRangeOption, setDateRangeOption] = useState("last-30");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  // Default date range logic
  const getDefaultDateRange = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    return {
      startDate: oneMonthAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const handleSearch = () => {
    const today = new Date();
    let startDate, endDate;

    if (dateRangeOption === "custom" && customStartDate && customEndDate) {
      startDate = customStartDate.toISOString().split("T")[0];
      endDate = customEndDate.toISOString().split("T")[0];
    } else if (dateRangeOption === "current-month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else if (dateRangeOption === "last-60") {
      const start = new Date(today);
      start.setDate(today.getDate() - 60);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    } else {
      // default to last 30 days
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      startDate = start.toISOString().split("T")[0];
      endDate = today.toISOString().split("T")[0];
    }

    if (onDateRangeChange) {
      console.log("Sending new dates: ", startDate, endDate);
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortOrder("desc");
    }
  };

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    const defaultStart = oneMonthAgo.toISOString().split("T")[0];
    const defaultEnd = today.toISOString().split("T")[0];

    setStartDate(defaultStart);
    setEndDate(defaultEnd);

    if (data) {
      const options = Object.keys(data).map((key) => ({
        value: key,
        label: data[key].ecoCode || key,
      }));
      setFilterOptions(options);
    }
  }, [data]);

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

  // const summary = useMemo(() => {
  //   return Object.values(filteredEntries).reduce(
  //     (acc, val) => {
  //       acc.played += val.played;
  //       acc.won += val.won;
  //       acc.lost += val.lost;
  //       acc.drawn += val.drawn;
  //       return acc;
  //     },
  //     { played: 0, won: 0, lost: 0, drawn: 0 },
  //   );
  // }, [filteredEntries]);

  const fullSummary = useMemo(() => {
    return Object.values(data).reduce(
      (acc, val) => {
        acc.played += val.played;
        acc.won += val.won;
        acc.lost += val.lost;
        acc.drawn += val.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );
  }, [data]);

  const totalRows = Object.keys(data).length;
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
      <table className="chess-table">
        <thead>
          <tr className="summary-row">
            <th colSpan="10">
              <div className="summary-bar-vertical">
                <div className="summary-text">
                  All Games: (P: {fullSummary.played}, W: {fullSummary.won}, L:{" "}
                  {fullSummary.lost}, D: {fullSummary.drawn})<br />
                  Showing {visibleRows} rows out of {totalRows}
                </div>
                <div className="filter-dropdown">
                  <Select
                    options={filterOptions}
                    isMultitota
                    placeholder="Filter openings"
                    value={selectedOptions}
                    onChange={setSelectedOptions}
                    classNamePrefix="react-select"
                    components={{ MultiValue }}
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
                    dateRangeOption={dateRangeOption}
                    setDateRangeOption={setDateRangeOption}
                    customStartDate={customStartDate}
                    customEndDate={customEndDate}
                    setCustomStartDate={setCustomStartDate}
                    setCustomEndDate={setCustomEndDate}
                  />
                  <button onClick={handleSearch} className="search-button">
                    Search
                  </button>
                </div>
                <div className="summary-buttons">
                  <button onClick={() => setViewLimit(5)}>Show 5</button>
                  <button onClick={() => setViewLimit(10)}>Show 10</button>
                  <button onClick={() => setViewLimit(totalRows)}>
                    Show All
                  </button>
                  <button onClick={clearFilters}>Clear Filters</button>
                </div>
              </div>
            </th>
          </tr>
          <tr>
            <th className="sortable" onClick={() => handleSort("name")}>
              Opening Name
            </th>
            <th>Opening Name with Eco</th>
            <th className="sortable" onClick={() => handleSort("played")}>
              Played
            </th>
            <th className="sortable" onClick={() => handleSort("won")}>
              Won
            </th>
            <th className="sortable" onClick={() => handleSort("lost")}>
              Lost
            </th>
            <th className="sortable" onClick={() => handleSort("drawn")}>
              Drawn
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(filteredEntries).map(([name, stats]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>
                <a
                  href={generateChessComLink(stats.ecoUrlString)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {stats.ecoCode}
                </a>
              </td>
              <td>
                {renderLinkedCell(stats.played, null, stats.ecoUrlString)}
              </td>
              <td>{renderLinkedCell(stats.won, "win", stats.ecoUrlString)}</td>
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
  );
};

export default OpeningStatsTable;
