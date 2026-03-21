import { useState } from 'react';
import { billReminderService } from '../api/services/billReminderService';

export function useBillReminder() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billReminderService.getAll();
      setReminders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch bill reminders');
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (reminderData) => {
    try {
      const newReminder = await billReminderService.create(reminderData);
      setReminders([...reminders, newReminder]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create reminder');
      return false;
    }
  };

  const markAsPaid = async (id) => {
    try {
      const updated = await billReminderService.markAsPaid(id);
      setReminders(reminders.map(r => r.id === id ? updated : r));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to mark reminder as paid');
      return false;
    }
  };

  const deleteReminder = async (id) => {
    try {
      await billReminderService.delete(id);
      setReminders(reminders.filter(r => r.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete reminder');
      return false;
    }
  };

  return {
    reminders,
    loading,
    error,
    fetchReminders,
    addReminder,
    markAsPaid,
    deleteReminder
  };
}