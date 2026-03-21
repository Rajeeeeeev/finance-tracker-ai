import { useState } from 'react';
import { liabilityService } from '../api/services/liabilityService';

export default function useLiability() {
  const [liabilities, setLiabilities] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiabilities = async () => {
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
  };

  const fetchPayments = async () => {
    try {
      const data = await liabilityService.getPayments();
      setPayments(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
      setPayments([]);
    }
  };

  const addLiability = async (liabilityData) => {
    try {
      const newLiability = await liabilityService.create(liabilityData);
      setLiabilities([...liabilities, newLiability]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create liability');
      return false;
    }
  };

  const addPayment = async (paymentData) => {
    try {
      const newPayment = await liabilityService.createPayment(paymentData);
      setPayments([...payments, newPayment]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create payment record');
      return false;
    }
  };

  const deleteLiability = async (id) => {
    try {
      await liabilityService.delete(id);
      setLiabilities(liabilities.filter(l => l.id !== id));
      setPayments(payments.filter(p => p.liability !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete liability');
      return false;
    }
  };

  const deletePayment = async (id) => {
    try {
      await liabilityService.deletePayment(id);
      setPayments(payments.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete payment record');
      return false;
    }
  };

  return {
    liabilities,
    payments,
    loading,
    error,
    fetchLiabilities,
    fetchPayments,
    addLiability,
    addPayment,
    deleteLiability,
    deletePayment
  };
}