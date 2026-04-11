import { useState, useCallback, useEffect } from "react";
import { analyticsService } from "../api/services/analyticsService";

export function useAnalytics() {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryData, setCategoryData] = useState({ breakdown: [], total: 0 });
  const [yoyData, setYoyData] = useState({
    data: [],
    current_year: today.getFullYear(),
    prev_year: today.getFullYear() - 1,
  });

  const [loading, setLoading] = useState({
    trend: false,
    category: false,
    yoy: false,
  });

  const [errors, setErrors] = useState({});

  // ✅ FIXED: no .data
  const fetchMonthlyTrend = useCallback(async () => {
    setLoading((prev) => ({ ...prev, trend: true }));
    try {
      const data = await analyticsService.getMonthlyTrend();
      console.log("MonthlyTrend:", data); // DEBUG
      setMonthlyTrend(data || []);
    } catch (e) {
      setErrors((prev) => ({ ...prev, trend: e.message }));
    } finally {
      setLoading((prev) => ({ ...prev, trend: false }));
    }
  }, []);

  const fetchCategoryBreakdown = useCallback(async () => {
    setLoading((prev) => ({ ...prev, category: true }));
    try {
      const data = await analyticsService.getCategoryBreakdown(
        selectedYear,
        selectedMonth
      );
      setCategoryData(data || { breakdown: [], total: 0 });
    } catch (e) {
      setErrors((prev) => ({ ...prev, category: e.message }));
    } finally {
      setLoading((prev) => ({ ...prev, category: false }));
    }
  }, [selectedYear, selectedMonth]);

  const fetchYOY = useCallback(async () => {
    setLoading((prev) => ({ ...prev, yoy: true }));
    try {
      const data = await analyticsService.getYearOverYear();
      setYoyData(data || {});
    } catch (e) {
      setErrors((prev) => ({ ...prev, yoy: e.message }));
    } finally {
      setLoading((prev) => ({ ...prev, yoy: false }));
    }
  }, []);

  useEffect(() => {
    fetchMonthlyTrend();
  }, [fetchMonthlyTrend]);

  useEffect(() => {
    fetchCategoryBreakdown();
  }, [fetchCategoryBreakdown]);

  useEffect(() => {
    fetchYOY();
  }, [fetchYOY]);

  return {
    monthlyTrend,
    categoryData,
    yoyData,
    loading,
    errors,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
  };
}