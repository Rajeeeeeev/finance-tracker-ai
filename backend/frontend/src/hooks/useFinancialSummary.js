import { useState, useEffect, useCallback } from "react";
import financialSummaryService from "../api/services/financialSummary.service";

// filterMode: "current_month" | "specific_month" | "custom_range"
const useFinancialSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState("current_month");
  const [filterParams, setFilterParams] = useState({});

  const fetch = useCallback(async (payload = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await financialSummaryService.fetch(payload);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever filterParams changes
  useEffect(() => {
    fetch(filterParams);
  }, [filterParams, fetch]);

  const applyCurrentMonth = () => {
    setFilterMode("current_month");
    setFilterParams({});
  };

  const applySpecificMonth = (year, month) => {
    setFilterMode("specific_month");
    setFilterParams({ year, month });
  };

  const applyCustomRange = (start_date, end_date) => {
    setFilterMode("custom_range");
    setFilterParams({ start_date, end_date });
  };

  return {
    data,
    loading,
    error,
    filterMode,
    applyCurrentMonth,
    applySpecificMonth,
    applyCustomRange,
    refresh: () => fetch(filterParams),
  };
};

export default useFinancialSummary;