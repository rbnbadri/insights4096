import React, { useState, useMemo } from "react";
import Select from "react-select";

function OpeningStatsTable({ title, data, totals }) {
  const [showCount, setShowCount] = useState(5);
  const [selectedOptions, setSelectedOptions] = useState([]);
  //  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleClearFilters = () => {
    setSelectedOptions([]);
    setShowCount(5);
  };

  const uniqueEcoOptions = useMemo(() => {
    if (!data) return [];
    const seen = new Set();
    return Object.entries(data)
      .filter(([_, value]) => {
        if (seen.has(value.ecoCode)) return false;
        seen.add(value.ecoCode);
        return true;
      })
      .map(([_, value]) => ({
        label: value.ecoCode,
        value: value.ecoCode,
      }));
  }, [data]);

  const filteredEntries = useMemo(() => {
    if (!data) return [];
    const entries = Object.entries(data);

    let filtered = entries;
    if (selectedOptions.length > 0) {
      const selectedValues = selectedOptions.map((opt) => opt.value);
      filtered = entries.filter(([_, val]) =>
        selectedValues.includes(val.ecoCode),
      );
    }

    return filtered
      .sort((a, b) => b[1].played - a[1].played)
      .slice(0, showCount);
  }, [data, showCount, selectedOptions]);

  if (!data) return null;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr className="summary-row">
            <th colSpan="6">
              <div className="summary-header">
                {title} (P: {totals.played}, W: {totals.won}, L: {totals.lost},
                D: {totals.drawn})
                <Select
                  isMulti
                  options={uniqueEcoOptions}
                  value={selectedOptions}
                  // onMenuOpen={() => setDropdownOpen(true)}
                  // onMenuClose={() => setDropdownOpen(false)}
                  onChange={(selected) => setSelectedOptions(selected)}
                  placeholder="Filter openings"
                  classNamePrefix="react-select"
                />
                <div className="summary-buttons">
                  <button onClick={() => setShowCount(5)}>Top 5</button>
                  <button onClick={() => setShowCount(10)}>Top 10</button>
                  <button onClick={() => setShowCount(1000)}>Show All</button>
                  <button onClick={handleClearFilters}>Clear Filters</button>
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
          {filteredEntries.map(([opening, stats], idx) => (
            <tr key={idx}>
              <td>{opening}</td>
              <td>
                {stats.ecoUrl ? (
                  <a
                    href={stats.ecoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {stats.ecoCode}
                  </a>
                ) : (
                  stats.ecoCode
                )}
              </td>
              <td>{stats.played}</td>
              <td>{stats.won}</td>
              <td>{stats.lost}</td>
              <td>{stats.drawn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OpeningStatsTable;
