
import React, { useState, useMemo } from 'react';
import Select from 'react-select';
import './App.css';

function OpeningStatsTable({ data }) {
  const [sortConfig, setSortConfig] = useState({
    key: "played",
    direction: "desc",
  });
  const [visibleCount, setVisibleCount] = useState(5);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasFiltered, setHasFiltered] = useState(false);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const dataArray = Object.entries(data || {}).map(([name, stats]) => ({
      name,
      ...stats,
    }));

    if (sortConfig.key) {
      dataArray.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? 0;
        const bVal = b[sortConfig.key] ?? 0;
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return dataArray;
  }, [data, sortConfig]);

  const filteredSortedData = useMemo(() => {
    if (!hasFiltered || selectedOptions.length === 0) {
      return sortedData;
    }

    const selectedLabels = selectedOptions.map((option) => option.label);
    return sortedData.filter((item) => selectedLabels.includes(item.ecoCode));
  }, [sortedData, selectedOptions, hasFiltered]);

  const displayData = filteredSortedData.slice(0, visibleCount);

  const allOptions = useMemo(
    () =>
      sortedData.map((item) => ({
        value: item.ecoCode,
        label: item.ecoCode,
      })),
    [sortedData],
  );

  const handleSelectChange = (selected) => {
    setSelectedOptions(selected || []);
    setHasFiltered(true);
  };

  const clearFilters = () => {
    setSelectedOptions([]);
    setHasFiltered(false);
  };

  const total = useMemo(() => {
    return filteredSortedData.reduce(
      (acc, item) => {
        acc.played += item.played;
        acc.won += item.won;
        acc.lost += item.lost;
        acc.drawn += item.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );
  }, [filteredSortedData]);

  return (
    <div className="table-wrapper">
      <div className="table-header-bar">
        <div className="summary-text">
          All Openings: P: {total.played}, W: {total.won}, L: {total.lost}, D:{" "}
          {total.drawn}
        </div>
        <div className="button-group">
          <button onClick={() => setVisibleCount(5)}>Show 5</button>
          <button onClick={() => setVisibleCount(10)}>Show 10</button>
          <button onClick={() => setVisibleCount(sortedData.length)}>
            Show All
          </button>
          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      </div>

      <div className="filter-dropdown">
        <Select
          isMulti
          options={allOptions}
          onChange={handleSelectChange}
          value={selectedOptions}
          placeholder="Filter openings"
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <table>
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleSort("name")}>
              Opening Name
            </th>
            <th className="sortable" onClick={() => handleSort("ecoCode")}>
              Opening Name with ECO
            </th>
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
          {displayData.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>
                <a href={item.ecoUrl} target="_blank" rel="noopener noreferrer">
                  {item.ecoCode}
                </a>
              </td>
              <td>{item.played}</td>
              <td>{item.won}</td>
              <td>{item.lost}</td>
              <td>{item.drawn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OpeningStatsTable;
