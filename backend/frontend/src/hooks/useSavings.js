import { useState } from 'react';
import { savingsService } from '../api/services/savingsService';

export function useSavings() {
  const [goals, setGoals] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await savingsService.getGoals();
      setGoals(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch savings goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const data = await savingsService.getEntries();
      setEntries(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch savings entries');
      setEntries([]);
    }
  };

  const addGoal = async (goalData) => {
    try {
      const newGoal = await savingsService.createGoal(goalData);
      setGoals([...goals, newGoal]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create savings goal');
      return false;
    }
  };

  const addEntry = async (entryData) => {
    try {
      const newEntry = await savingsService.createEntry(entryData);
      setEntries([...entries, newEntry]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create savings entry');
      return false;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await savingsService.deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
      setEntries(entries.filter(e => e.savings_goal !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete savings goal');
      return false;
    }
  };

  const deleteEntry = async (id) => {
    try {
      await savingsService.deleteEntry(id);
      setEntries(entries.filter(e => e.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete savings entry');
      return false;
    }
  };

  return {
    goals,
    entries,
    loading,
    error,
    fetchGoals,
    fetchEntries,
    addGoal,
    addEntry,
    deleteGoal,
    deleteEntry
  };
}