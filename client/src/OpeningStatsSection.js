import React, { useEffect, useState, useMemo } from "react";
import SummaryBar from "./SummaryBar";
import OpeningTable from "./OpeningTable";
import TopOpeningsDownloadLinks from "./components/TopOpeningsDownloadLinks";
import ScrollToTopButton from "./components/ScrollToTopButton";
import { BACKEND_URL } from "./apiConfig";
import { triggerGreenToast, triggerRedToast } from "./utils/toast";
import { downloadPGN } from "./utils/downloadPGN";
import DownloadPGNSidebar from "./components/DownloadPGNSidebar";

const OpeningStatsSection = ({
  data = {},
  onDateRangeChange,
  loading,
  onResetToCachedOneMonth,
  resetToDefaultRange,
  fullResetTrigger,
  color = null,
  summaryLabel = "All Games",
  testId = `Openings filter- ${color}`,
  enteredUsername,
  username,
}) => {
  const [sortColumn, setSortColumn] = useState("played");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filterOptions, setFilterOptions] = useState([]);
  const [viewLimit, setViewLimit] = useState(5);
  const [showingFilteredSummary, setShowingFilteredSummary] = useState(false);
  const [dateRangeOption, setDateRangeOption] = useState("last-30");
  const [showDownloadSidebar, setShowDownloadSidebar] = useState(false);

  useEffect(() => {
    if (resetToDefaultRange) setDateRangeOption("last-30");
  }, [resetToDefaultRange]);

  useEffect(() => {
    if (data) {
      const sortedOptions = Object.entries(data[color])
        .sort(([, a], [, b]) => b.played - a.played)
        .map(([key, val]) => ({
          value: key,
          label: val.ecoCode || key,
        }));
      setFilterOptions(sortedOptions);
    }
  }, [data, color]);

  useEffect(() => {
    if (fullResetTrigger) {
      setSelectedOptions([]);
      setViewLimit(5);
      setShowingFilteredSummary(false);
    }
  }, [fullResetTrigger]);

  const handleSortColumn = (col) => {
    if (col === sortColumn) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortOrder("desc");
    }
  };

  const filteredEntries = useMemo(() => {
    const entries = Object.entries(data[color]);
    const filtered = selectedOptions.length
      ? entries.filter(([name]) =>
          selectedOptions.some((opt) => opt.value === name),
        )
      : entries;

    const sorted = filtered.sort(
      ([_, a], [__, b]) => {
        const order = sortOrder === "asc" ? 1 : -1;
        return (a[sortColumn] - b[sortColumn]) * order;
      },
      [data, color],
    );

    return Object.fromEntries(sorted.slice(0, viewLimit));
  }, [data, selectedOptions, sortColumn, sortOrder, viewLimit, color]);

  const fullSummary = useMemo(() => {
    return Object.entries(data[color]).reduce(
      (acc, [_, val]) => {
        acc.played += val.played;
        acc.won += val.won;
        acc.lost += val.lost;
        acc.drawn += val.drawn;
        return acc;
      },
      { played: 0, won: 0, lost: 0, drawn: 0 },
    );
  }, [data, color]);

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
    : Object.entries(data[color]).length;

  const visibleRows = Object.keys(filteredEntries).length;

  const handleShow5 = () => {
    setViewLimit(5);
    setShowingFilteredSummary(true);
  };

  const handleShow10 = () => {
    setViewLimit(10);
    setShowingFilteredSummary(true);
  };

  const handleShowAll = () => {
    setViewLimit(totalRows);
    setShowingFilteredSummary(selectedOptions.length > 0);
  };

  const handleClearFilters = () => {
    triggerGreenToast(
      "Clearing filters and setting date range to Last 1 Month.",
    );
    setSelectedOptions([]);
    setViewLimit(5);
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

  const availableOpenings = {
    white: data.white
      ? Object.entries(data.white)
          .sort(([, a], [, b]) => b.played - a.played)
          .map(([name]) => ({ name }))
      : [],
    black: data.black
      ? Object.entries(data.black)
          .sort(([, a], [, b]) => b.played - a.played)
          .map(([name]) => ({ name }))
      : [],
  };

  const handleDownloadRequest = async ({
    selectedColor,
    selectedOpenings,
    selectedResults,
    startDate,
    endDate,
  }) => {
    const eco = selectedOpenings.map((o) => o.replace(/ /g, "-")).join(",");
    const gameResult =
      selectedResults.length > 0 ? selectedResults.join(",") : undefined;

    await downloadPGN({
      urlBase: `${BACKEND_URL}/pgns/${username}`,
      queryParams: {
        color: selectedColor,
        eco,
        start: startDate,
        end: endDate,
        ...(gameResult && { gameResult }),
        source: "download_from_sidebar",
      },
      filenameFallback: "games.pgn",
      showToast: true,
      toastSuccess: triggerGreenToast,
      toastError: triggerRedToast,
    });
  };

  return (
    <div
      data-test-id={`Openings table - ${color || "both"}`}
      className="table-section"
    >
      <div className="table-wrapper">
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
          renderSortIndicator={(col) =>
            col === sortColumn ? (sortOrder === "asc" ? " ↑" : " ↓") : ""
          }
          startDate={data.startDate}
          endDate={data.endDate}
          handleSortColumn={handleSortColumn}
          enteredUsername={enteredUsername}
        />
      </div>
      <TopOpeningsDownloadLinks
        openingsData={data}
        startDate={data.startDate}
        endDate={data.endDate}
        username={username}
        onCustomDownloadClick={() => setShowDownloadSidebar(true)}
      />
      <DownloadPGNSidebar
        isOpen={showDownloadSidebar}
        onClose={() => setShowDownloadSidebar(false)}
        color={color}
        startDate={data.startDate}
        endDate={data.endDate}
        availableOpenings={availableOpenings}
        onDownload={handleDownloadRequest}
      />
      <ScrollToTopButton />
    </div>
  );
};

export default OpeningStatsSection;
