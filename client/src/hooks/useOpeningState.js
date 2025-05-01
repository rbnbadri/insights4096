import { useState, useEffect } from "react";
import { fetchOpenings } from "../api/fetchOpenings";
import { triggerRedToast, triggerGreenToast } from "../utils/toast";

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
  const [isDefaultLoad, setIsDefaultLoad] = useState(false);

  useEffect(() => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);

    setStartDate(oneMonthAgo.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const handleSearchClick = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setDate(today.getDate() - 30);
    const defaultStart = oneMonthAgo.toISOString().split("T")[0];
    const defaultEnd = today.toISOString().split("T")[0];

    setStartDate(defaultStart);
    setEndDate(defaultEnd);

    setResetToDefaultRange(true);
    setFullResetTrigger(true);
    setTimeout(() => {
      setResetToDefaultRange(false);
      setFullResetTrigger(false);
    }, 100);

    handleSubmit(defaultStart, defaultEnd, selectedColor, true);
  };

  const handleSubmit = async (
    start = startDate,
    end = endDate,
    section = selectedColor,
    forceDefaultToast = false,
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

      if (
        Object.keys(gamedata.white || {}).length === 0 &&
        Object.keys(gamedata.black || {}).length === 0
      ) {
        triggerRedToast("Zero games found for this user.");
        setSubmitted(false);
        return;
      } else {
        if (forceDefaultToast || isDefaultLoad) {
          triggerGreenToast(
            "Successfully retrieved games for the Last 1 Month.",
          );
        } else {
          triggerGreenToast(
            "Successfully retrieved games for the selected date range.",
          );
        }
      }

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
      setIsDefaultLoad(false);
      setLoadingState((prev) => ({ ...prev, [section]: false }));
    }
  };

  const handleResetToCachedOneMonth = () => {
    if (cachedOneMonthWhite) {
      setFilteredData((prev) => ({
        ...prev,
        white: cachedOneMonthWhite.data,
      }));
    }

    if (cachedOneMonthBlack) {
      setFilteredData((prev) => ({
        ...prev,
        black: cachedOneMonthBlack.data,
      }));
    }

    if (cachedOneMonthWhite?.startDate && cachedOneMonthWhite?.endDate) {
      setStartDate(cachedOneMonthWhite.startDate);
      setEndDate(cachedOneMonthWhite.endDate);
    }

    setSubmitted(true);
    setResetToDefaultRange(true);
    setTimeout(() => setResetToDefaultRange(false), 100);
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
    handleSearchClick,
    isDefaultLoad,
    setIsDefaultLoad,
  };
}
