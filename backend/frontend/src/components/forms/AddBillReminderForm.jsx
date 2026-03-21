import React, { useState } from 'react';
import { billReminderService } from '../../api/services/billReminderService';
import { Button, Loader } from '../../components/ui';
// import Button from '../components/ui/Button';

const BILL_CATEGORIES = [
  'Electricity',
  'Water',
  'Internet',
  'Mobile',
  'Insurance',
  'Rent',
  'Subscriptions',
  'Maintenance',
  'Other'
];

export default function AddBillReminderForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    bill_name: '',
    category: 'Electricity',
    amount: '',
    due_date: '',
    notes: '',
    is_recurring: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.bill_name || !formData.amount || !formData.due_date) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const payload = {
        bill_name: formData.bill_name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        notes: formData.notes,
        is_recurring: formData.is_recurring
      };

      await billReminderService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create bill reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Bill Name *
        </label>
        <input
          type="text"
          name="bill_name"
          value={formData.bill_name}
          onChange={handleChange}
          placeholder="e.g., Electricity Bill"
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
            {BILL_CATEGORIES.map(cat => (
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
          Due Date *
        </label>
        <input
          type="date"
          name="due_date"
          value={formData.due_date}
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
        />
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

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="checkbox"
          name="is_recurring"
          checked={formData.is_recurring}
          onChange={handleChange}
          style={{ cursor: 'pointer', width: '20px', height: '20px' }}
        />
        <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', cursor: 'pointer' }}>
          This is a recurring bill (auto-create next month)
        </label>
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
          {loading ? '⏳ Loading...' : 'Create Reminder'}
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