import { useState, useCallback } from 'react';
import { liabilityService } from '../api/services/liabilityService';

export default function useLiability() {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FIXED: useCallback for stable reference (prevents useEffect ESLint warning)
  const fetchLiabilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await liabilityService.getAll();
      setLiabilities(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch liabilities');
      setLiabilities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLiability = async (liabilityData) => {
    try {
      const newLiability = await liabilityService.create(liabilityData);
      setLiabilities(prev => [...prev, newLiability]);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to create liability');
      return { success: false, error: err.message };
    }
  };

  // FIXED: payEMI calls the correct POST /<id>/pay/ endpoint
  // Backend auto-calculates principal/interest split — no form needed
  const payEMI = async (liabilityId) => {
    try {
      const result = await liabilityService.payEMI(liabilityId);
      // Refresh liabilities so remaining_principal and remaining_months update
      await fetchLiabilities();
      return { success: true, data: result };
    } catch (err) {
      const message = err.message || 'Failed to record EMI payment';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteLiability = async (id) => {
    try {
      await liabilityService.delete(id);
      setLiabilities(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete liability');
      return false;
    }
  };

  const closeLiability = async (id) => {
    try {
      const result = await liabilityService.close(id);
      // Refresh so the closed loan moves to inactive
      await fetchLiabilities();
      return { success: true, data: result };
    } catch (err) {
      const message = err.message || 'Failed to close liability';
      setError(message);
      return { success: false, error: message };
    }
  };

  return {
    liabilities,
    loading,
    error,
    fetchLiabilities,
    addLiability,
    payEMI,
    deleteLiability,
    closeLiability,
  };
}