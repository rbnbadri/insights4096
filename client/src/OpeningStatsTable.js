import React, { useEffect, useState, useMemo } from "react";
import SummaryBar from "./SummaryBar";
import OpeningTable from "./OpeningTable";

const OpeningStatsTable = ({
  data = {},
  onDateRangeChange,
  loading,
  onResetToCachedOneMonth,
  resetToDefaultRange,
  fullResetTrigger,
  color = null,
  summaryLabel = "All Games",
  testId = `Openings filter- ${color}`,
}) => {
  const [sortColumn, setSortColumn] = useState("played");
  const [sortOrder] = useState("desc");
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [viewLimit, setViewLimit] = useState(5);
  const [showingFilteredSummary, setShowingFilteredSummary] = useState(false);
  const [dateRangeOption, setDateRangeOption] = useState("last-30");

  useEffect(() => {
    if (resetToDefaultRange) setDateRangeOption("last-30");
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
    <div data-test-id={`Openings table - ${color || "both"}`}>
      <SummaryBar
        {...{
          summaryLabel,
          fullSummary,
          filteredSummary,
          selectedOptions,
          setSelectedOptions,
          filterOptions,
          showingFilteredSummary,
          setShowingFilteredSummary,
          dateRangeOption,
          setDateRangeOption,
          onDateRangeChange,
          onResetToCachedOneMonth,
          viewLimit,
          setViewLimit,
          totalRows,
          visibleRows,
          testId,
          color,
        }}
      />
      <OpeningTable
        color={color}
        loading={loading}
        filteredEntries={filteredEntries}
        renderSortIndicator={renderSortIndicator}
        setSortColumn={setSortColumn}
        startDate={data.startDate}
        endDate={data.endDate}
      />
    </div>
  );
};

export default OpeningStatsTable;
