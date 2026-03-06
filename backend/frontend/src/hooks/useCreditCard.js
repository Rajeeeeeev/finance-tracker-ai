import { useState, useEffect, useCallback } from "react";
import { creditCardService } from "../services/creditCardService";

const useCreditCard = () => {
  const [cards, setCards]         = useState([]);
  const [summary, setSummary]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cardsRes, summaryRes] = await Promise.all([
        creditCardService.getAll(),
        creditCardService.getSummary(),
      ]);
      setCards(cardsRes.data);
      setSummary(summaryRes.data);
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
      const res = await creditCardService.create(payload);
      await fetchCards();
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : "Failed to add card.";
      return { success: false, error: msg };
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

  return { cards, summary, loading, error, submitting, addCard, deleteCard, refetch: fetchCards };
};

export default useCreditCard;