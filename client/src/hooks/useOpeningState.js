import { useState, useEffect } from "react";
import { fetchOpenings } from "../api/fetchOpenings";

export default function useOpeningState(username) {
  const [filteredData, setFilteredData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loadingState, setLoadingState] = useState({
    white: false,
    black: false,
  });

  const [cachedOneMonthWhite, setCachedOneMonthWhite] = useState(null);
  const [cachedOneMonthBlack, setCachedOneMonthBlack] = useState(null);

  const [resetToDefaultRange, setResetToDefaultRange] = useState(false);
  const [fullResetTrigger, setFullResetTrigger] = useState(false);
  const [expandedTable, setExpandedTable] = useState(null);

  const [selectedColor, setSelectedColor] = useState("white");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showingFilteredSummary, setShowingFilteredSummary] = useState(false);
  const [sortColumn, setSortColumn] = useState("played");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    setStartDate(oneMonthAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async (
    start = startDate,
    end = endDate,
    section = selectedColor,
  ) => {
    if (!username) return;

    setLoadingState((prev) => ({ ...prev, [section]: true }));

    try {
      const gamedata = await fetchOpenings(
        username,
        start,
        end,
        setCachedOneMonthWhite,
        setCachedOneMonthBlack,
      );

      setFilteredData({
        white: gamedata.white,
        black: gamedata.black,
        startDate: start,
        endDate: end,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingState((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleResetToCachedOneMonth = (color) => {
    const cache = color === "white" ? cachedOneMonthWhite : cachedOneMonthBlack;
    if (cache) {
      setFilteredData((prev) => ({
        ...prev,
        [color]: cache.data,
      }));
      setStartDate(cache.startDate);
      setEndDate(cache.endDate);
      setSubmitted(true);
      setResetToDefaultRange(true);
      setTimeout(() => setResetToDefaultRange(false), 100);
    }
  };

  return {
    filteredData,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    submitted,
    loadingState,
    resetToDefaultRange,
    setResetToDefaultRange,
    fullResetTrigger,
    setFullResetTrigger,
    expandedTable,
    setExpandedTable,
    selectedColor,
    setSelectedColor,
    selectedOptions,
    setSelectedOptions,
    showingFilteredSummary,
    setShowingFilteredSummary,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    handleSubmit,
    handleResetToCachedOneMonth,
    setResetToDefaultRange,
  };
}
