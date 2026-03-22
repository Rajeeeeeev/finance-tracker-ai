import { useState, useCallback } from 'react';
import { billReminderService } from '../api/services/billReminderService';

export function useBillReminder() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReminders = useCallback(async () => {
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
  }, []);

  const addReminder = async (reminderData) => {
    try {
      const newReminder = await billReminderService.create(reminderData);
      setReminders(prev => [...prev, newReminder]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to create reminder');
      return false;
    }
  };

  const markAsPaid = async (id) => {
    try {
      // API returns: { message, reminder, expense_created, next_reminder_created, next_reminder }
      const response = await billReminderService.markAsPaid(id);

      const updatedReminder = response.reminder;
      const nextReminder = response.next_reminder;

      setReminders(prev => {
        // Replace the paid reminder with updated version
        const updated = prev.map(r => r.id === id ? updatedReminder : r);

        // If a next recurring reminder was created, append it to the list
        if (nextReminder) {
          updated.push(nextReminder);
        }

        return updated;
      });

      return {
        success: true,
        expenseCreated: response.expense_created,
        nextReminderCreated: response.next_reminder_created,
      };
    } catch (err) {
      setError(err.message || 'Failed to mark reminder as paid');
      return { success: false };
    }
  };

  const deleteReminder = async (id) => {
    try {
      await billReminderService.delete(id);
      setReminders(prev => prev.filter(r => r.id !== id));
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