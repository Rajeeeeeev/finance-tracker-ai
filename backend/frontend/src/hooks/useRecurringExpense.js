import { useState } from 'react';
import { recurringExpenseService } from '../api/services/recurringExpenseService';

export function useRecurringExpense() {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecurringExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recurringExpenseService.getAll();
      setRecurringExpenses(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch recurring expenses');
      setRecurringExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addRecurringExpense = async (expenseData) => {
    try {
      const newExpense = await recurringExpenseService.create(expenseData);
      setRecurringExpenses([...recurringExpenses, newExpense]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create recurring expense');
      return false;
    }
  };

  const deleteRecurringExpense = async (id) => {
    try {
      await recurringExpenseService.delete(id);
      setRecurringExpenses(recurringExpenses.filter(re => re.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete recurring expense');
      return false;
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      const updated = await recurringExpenseService.update(id, { is_active: isActive });
      setRecurringExpenses(recurringExpenses.map(re => re.id === id ? updated : re));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to update recurring expense');
      return false;
    }
  };

  return {
    recurringExpenses,
    loading,
    error,
    fetchRecurringExpenses,
    addRecurringExpense,
    deleteRecurringExpense,
    toggleActive
  };
}