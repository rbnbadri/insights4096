import React, { useEffect, useState, useMemo } from "react";
import SummaryBar from "./SummaryBar";
import OpeningTable from "./OpeningTable";
import ControlButtons from "./ControlButtons";

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
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [viewLimit, setViewLimit] = useState(5);
  const [showBottomControls, setShowBottomControls] = useState(false);
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
      setShowBottomControls(false);
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

  const totalRows = selectedOptions.length
    ? selectedOptions.length
    : Object.entries(data).filter(
        ([key]) => !["startDate", "endDate"].includes(key),
      ).length;

  const visibleRows = Object.keys(filteredEntries).length;

  const handleShow5 = () => {
    setViewLimit(5);
    setShowBottomControls(false);
    setShowingFilteredSummary(true);
  };

  const handleShow10 = () => {
    setViewLimit(10);
    setShowBottomControls(true);
    setShowingFilteredSummary(true);
  };

  const handleShowAll = () => {
    setViewLimit(totalRows);
    setShowBottomControls(true);
    setShowingFilteredSummary(selectedOptions.length > 0);
  };

  const handleClearFilters = () => {
    setSelectedOptions([]);
    setViewLimit(5);
    setShowBottomControls(false);
    setShowingFilteredSummary(false);
    if (onResetToCachedOneMonth) onResetToCachedOneMonth();
  };

  const summaryData = {
    summaryLabel,
    fullSummary,
    filteredSummary,
  };

  const filterProps = {
    selectedOptions,
    setSelectedOptions,
    filterOptions,
    showingFilteredSummary,
    setShowingFilteredSummary,
  };

  const dateRangeProps = {
    dateRangeOption,
    setDateRangeOption,
    onDateRangeChange,
    onResetToCachedOneMonth,
  };

  const controlProps = {
    handleShow5,
    handleShow10,
    handleShowAll,
    handleClearFilters,
  };

  const tableMetrics = {
    totalRows,
    visibleRows,
    testId,
    color,
  };

  return (
    <div data-test-id={`Openings table - ${color || "both"}`}>
      <SummaryBar
        summaryData={summaryData}
        filterProps={filterProps}
        dateRangeProps={dateRangeProps}
        controlProps={controlProps}
        tableMetrics={tableMetrics}
      />
      <OpeningTable
        color={color}
        loading={loading}
        filteredEntries={filteredEntries}
        renderSortIndicator={(col) => (col === sortColumn ? " ↓" : null)}
        setSortColumn={setSortColumn}
        startDate={data.startDate}
        endDate={data.endDate}
      />
      {showBottomControls && (
        <div className="summary-bar-bottom">
          <ControlButtons {...controlProps} />
        </div>
      )}
    </div>
  );
};

export default OpeningStatsTable;
