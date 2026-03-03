import { useState, useEffect, useCallback } from "react";
import investmentService from "../api/services/investment.service";

const useInvestment = () => {
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [list, sum] = await Promise.all([
        investmentService.list(),
        investmentService.summary(),
      ]);
      setInvestments(Array.isArray(list) ? list : []);
      setSummary(sum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addInvestment = async (payload) => {
    setSubmitting(true);
    try {
      await investmentService.add(payload);
      await fetchAll();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteInvestment = async (id) => {
    try {
      await investmentService.delete(id);
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { investments, summary, loading, error, submitting, addInvestment, deleteInvestment, refresh: fetchAll };
};

export default useInvestment;