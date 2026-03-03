import { useState, useEffect, useCallback } from "react";
import incomeService from "../api/services/income.service";

const useIncome = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await incomeService.list();
      setIncomes(result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addIncome = async (payload) => {
    setSubmitting(true);
    try {
      await incomeService.add(payload);
      await fetchList(); // refresh list after adding
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteIncome = async (id) => {
    try {
      await incomeService.delete(id);
      setIncomes((prev) => prev.filter((i) => i.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { incomes, loading, error, submitting, addIncome, deleteIncome, refresh: fetchList };
};

export default useIncome;