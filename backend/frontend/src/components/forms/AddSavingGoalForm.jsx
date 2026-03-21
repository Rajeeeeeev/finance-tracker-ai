import React, { useState } from 'react';
import { savingsService } from '../../api/services/savingsService';
import { Button, Loader } from '../../components/ui';

export default function AddSavingGoalForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    start_date: '',
    end_date: '',
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
      if (!formData.name || !formData.target_amount || !formData.start_date || !formData.end_date) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate end date is after start date
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        setError('End date must be after start date');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: 'ACTIVE'
      };

      await savingsService.createGoal(payload);
      setFormData({
        name: '',
        target_amount: '',
        start_date: '',
        end_date: '',
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Goal Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Vacation to Paris"
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
            Target Amount (₹) *
          </label>
          <input
            type="number"
            name="target_amount"
            value={formData.target_amount}
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

        <div>
          <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Start Date *
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
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
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          End Date *
        </label>
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
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
          {loading ? '⏳ Creating...' : 'Create Goal'}
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