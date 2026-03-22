import React, { useState } from 'react';
import { recurringExpenseService } from '../../api/services/recurringExpenseService';
import { Button, Loader } from '../../components/ui';
//import Loader from '../../components/ui/Loader';

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Groceries',
  'Rent',
  'Utilities',
  'Savings',
  'Other'
];
const FREQUENCIES = [
  { value: 'DAILY', label: 'Daily' },        // ← UPPERCASE
  { value: 'WEEKLY', label: 'Weekly' },      // ← UPPERCASE
  { value: 'MONTHLY', label: 'Monthly' },    // ← UPPERCASE
  { value: 'YEARLY', label: 'Yearly' }       // ← UPPERCASE
];


export default function AddRecurringExpenseForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    expense_name: '',
    category: 'Food',
    amount: '',
    frequency: 'MONTHLY',  
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.expense_name || !formData.amount || !formData.frequency) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const payload = {
  title: formData.expense_name,
  category: formData.category,
  amount: parseFloat(formData.amount),
  frequency: formData.frequency,  // ← Now uppercase
  start_date: new Date().toISOString().split('T')[0],  // ← ADD THIS
  is_active: true
};

      await recurringExpenseService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create recurring expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Expense Name *
        </label>
        <input
          type="text"
          name="expense_name"
          value={formData.expense_name}
          onChange={handleChange}
          placeholder="e.g., Gym Membership"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          >
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Amount *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            step="0.01"
            min="0"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Frequency *
        </label>
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        >
          {FREQUENCIES.map(freq => (
            <option key={freq.value} value={freq.value}>{freq.label}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any additional notes..."
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'var(--red-soft)',
          color: 'var(--red)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? <Loader /> : 'Create Template'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
          style={{ flex: 1 }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}