import React, { useState, useMemo } from "react";
import Select from "react-select";

function OpeningStatsTable({ title, data, side }) {
  const [showCount, setShowCount] = useState(5);
  const [selectedOptions, setSelectedOptions] = useState([]);

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

  const { filteredTotals, totalRows } = useMemo(() => {
    const filtered = Object.entries(data).filter(
      ([_, val]) =>
        selectedOptions.length === 0 ||
        selectedOptions.some((opt) => opt.value === val.ecoCode),
    );

    const totals = filtered.reduce(
      (acc, [_, val]) => {
        acc.played += val.played;
        acc.won += val.won;
        acc.lost += val.lost;
        acc.drawn += val.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );

    return { filteredTotals: totals, totalRows: filtered.length };
  }, [data, selectedOptions]);

  if (!data) return null;

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr className="summary-row">
            <th colSpan="6">
              <div className="summary-header">
                {title} (P: {filteredTotals.played}, W: {filteredTotals.won}, L:{" "}
                {filteredTotals.lost}, D: {filteredTotals.drawn}) — Showing{" "}
                {Object.keys(filteredEntries).length} rows out of {totalRows}
                <Select
                  isMulti
                  options={uniqueEcoOptions}
                  value={selectedOptions}
                  onChange={(selected) => setSelectedOptions(selected)}
                  placeholder="Filter openings"
                  classNamePrefix="react-select"
                  hideSelectedOptions={false}
                  styles={{
                    multiValue: (base, { data, index }) => {
                      if (index < 3) return base;
                      return { ...base, display: "none" };
                    },
                    valueContainer: (base) => ({
                      ...base,
                      position: "relative",
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      position: "absolute",
                      right: 0,
                    }),
                  }}
                  formatOptionLabel={(data, { context }) => {
                    if (context === "value") {
                      const index = selectedOptions.findIndex(
                        (opt) => opt.value === data.value,
                      );
                      if (index === 2 && selectedOptions.length > 3) {
                        return `${data.label}, ...`;
                      }
                      if (index >= 3) return null;
                      return data.label;
                    }
                    return data.label;
                  }}
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
