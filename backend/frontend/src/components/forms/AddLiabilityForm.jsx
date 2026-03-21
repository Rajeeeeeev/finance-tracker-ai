import React, { useState } from 'react';
import { liabilityService } from '../../api/services/liabilityService';
import { Button, Loader } from '../../components/ui';
// import Button from '../components/ui/Button';

const LIABILITY_TYPES = [
  'Home Loan',
  'Car Loan',
  'Personal Loan',
  'Credit Card Debt',
  'Education Loan',
  'Business Loan',
  'Other'
];

export default function AddLiabilityForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    liability_type: 'Home Loan',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: new Date().toISOString().split('T')[0]
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
      if (!formData.name || !formData.principal_amount || !formData.interest_rate || !formData.tenure_months || !formData.start_date) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        liability_type: formData.liability_type,
        principal_amount: parseFloat(formData.principal_amount),
        interest_rate: parseFloat(formData.interest_rate),
        tenure_months: parseInt(formData.tenure_months),
        start_date: formData.start_date
      };

      await liabilityService.create(payload);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create liability');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Liability Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Home Loan - HDFC"
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
          Type *
        </label>
        <select
          name="liability_type"
          value={formData.liability_type}
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
          {LIABILITY_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Principal Amount *
          </label>
          <input
            type="number"
            name="principal_amount"
            value={formData.principal_amount}
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
            Interest Rate (% p.a.) *
          </label>
          <input
            type="number"
            name="interest_rate"
            value={formData.interest_rate}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
            Tenure (months) *
          </label>
          <input
            type="number"
            name="tenure_months"
            value={formData.tenure_months}
            onChange={handleChange}
            placeholder="0"
            step="1"
            min="1"
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
          {loading ? <Loader /> : 'Create Liability'}
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