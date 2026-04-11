import { useState, useEffect, useCallback } from "react";
import { creditCardService } from "../api/services/creditCardService";
import { billReminderService } from "../api/services/billReminderService";

const useCreditCard = () => {
  const [cards, setCards]           = useState([]);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // getSummary() returns { cards: [...summaries], total_credit_limit, ... }
      // Each entry already has current_balance, available_credit, utilization_percent.
      // Using only this endpoint avoids stale data from a separate getAll() call.
      const summaryRes = await creditCardService.getSummary();
      setCards(summaryRes.cards || []);
      setSummary(summaryRes);
    } catch (err) {
      setError("Failed to load credit cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const addCard = async (payload) => {
    setSubmitting(true);
    try {
      await creditCardService.create(payload);
      await fetchCards();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to add card." };
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCard = async (id) => {
    try {
      await creditCardService.remove(id);
      await fetchCards();
    } catch {
      setError("Failed to remove card.");
    }
  };

  // Pay a credit card bill.
  // Uses markAsPaid — the correct method name in billReminderService.
  // After payment, re-fetches summary so balance resets to 0 instantly.
  const payBill = async (reminderId) => {
    setSubmitting(true);
    try {
      await billReminderService.markAsPaid(reminderId); // ✅ correct name
      await fetchCards();                               // ✅ triggers balance refresh
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || "Failed to mark bill as paid." };
    } finally {
      setSubmitting(false);
    }
  };

  return {
    cards,
    summary,
    loading,
    error,
    submitting,
    addCard,
    deleteCard,
    payBill,
    refetch: fetchCards,
  };
};

export default useCreditCard;