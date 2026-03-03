import { useState, useEffect, useCallback } from "react";
import expenseService from "../api/services/expense.service";

const useExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await expenseService.list();
      // backend returns array directly or { data: [] }
      setExpenses(Array.isArray(result) ? result : result.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const addExpense = async (payload) => {
    setSubmitting(true);
    try {
      await expenseService.add(payload);
      await fetchList();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseService.delete(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { expenses, loading, error, submitting, addExpense, deleteExpense, refresh: fetchList };
};

export default useExpense;