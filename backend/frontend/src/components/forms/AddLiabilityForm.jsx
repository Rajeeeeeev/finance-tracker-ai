import React, { useState } from 'react';
import { liabilityService } from '../../api/services/liabilityService';
import { Button, Loader } from '../../components/ui';

// FIXED: values must match backend LiabilityType choices exactly
const LIABILITY_TYPES = [
  { value: 'HOME_LOAN',       label: '🏠 Home Loan' },
  { value: 'CAR_LOAN',        label: '🚗 Car Loan' },
  { value: 'EDUCATION_LOAN',  label: '🎓 Education Loan' },
  { value: 'PERSONAL_LOAN',   label: '👤 Personal Loan' },
  { value: 'CREDIT_CARD',     label: '💳 Credit Card' },
  { value: 'OTHER',           label: '📋 Other' },
];

export default function AddLiabilityForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    liability_type: 'HOME_LOAN',
    principal_amount: '',
    interest_rate: '',
    tenure_months: '',
    start_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live EMI preview
  const calculatePreviewEMI = () => {
    const P = parseFloat(formData.principal_amount);
    const r = parseFloat(formData.interest_rate) / 12 / 100;
    const n = parseInt(formData.tenure_months);
    if (!P || !n || isNaN(P) || isNaN(n)) return null;
    if (!formData.interest_rate || r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const previewEMI = calculatePreviewEMI();
  const previewTotal = previewEMI && formData.tenure_months
    ? previewEMI * parseInt(formData.tenure_months)
    : null;
  const previewInterest = previewTotal && formData.principal_amount
    ? previewTotal - parseFloat(formData.principal_amount)
    : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.principal_amount || !formData.interest_rate || !formData.tenure_months || !formData.start_date) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.principal_amount) <= 0) {
      setError('Principal amount must be greater than 0');
      return;
    }

    if (parseFloat(formData.interest_rate) < 0 || parseFloat(formData.interest_rate) > 50) {
      setError('Interest rate must be between 0 and 50%');
      return;
    }

    if (parseInt(formData.tenure_months) < 1) {
      setError('Tenure must be at least 1 month');
      return;
    }

    setLoading(true);
    try {
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

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontSize: '1rem',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '0.5rem'
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Name */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Liability Name *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Home Loan - HDFC"
          style={inputStyle}
        />
      </div>

      {/* Type */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Type *</label>
        <select name="liability_type" value={formData.liability_type} onChange={handleChange} style={inputStyle}>
          {LIABILITY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Principal + Interest Rate */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Principal Amount (₹) *</label>
          <input
            type="number"
            name="principal_amount"
            value={formData.principal_amount}
            onChange={handleChange}
            placeholder="e.g., 500000"
            step="1"
            min="1"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Interest Rate (% p.a.) *</label>
          <input
            type="number"
            name="interest_rate"
            value={formData.interest_rate}
            onChange={handleChange}
            placeholder="e.g., 8.5"
            step="0.01"
            min="0"
            max="50"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Tenure + Start Date */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Tenure (months) *</label>
          <input
            type="number"
            name="tenure_months"
            value={formData.tenure_months}
            onChange={handleChange}
            placeholder="e.g., 240"
            step="1"
            min="1"
            style={inputStyle}
          />
          {formData.tenure_months && parseInt(formData.tenure_months) >= 12 && (
            <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              = {Math.floor(parseInt(formData.tenure_months) / 12)} yr
              {parseInt(formData.tenure_months) % 12 > 0 ? ` ${parseInt(formData.tenure_months) % 12} mo` : ''}
            </p>
          )}
        </div>
        <div>
          <label style={labelStyle}>Start Date *</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Live EMI Preview */}
      {previewEMI && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            EMI Preview
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Monthly EMI</p>
              <p style={{ margin: 0, color: 'var(--accent)', fontSize: '1.1rem', fontWeight: '700' }}>
                {formatCurrency(previewEMI)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Payable</p>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
                {formatCurrency(previewTotal)}
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Interest</p>
              <p style={{ margin: 0, color: 'var(--red, #e53e3e)', fontSize: '1rem', fontWeight: '600' }}>
                {formatCurrency(previewInterest)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
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

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button type="submit" variant="primary" disabled={loading} style={{ flex: 1 }}>
          {loading ? <Loader /> : 'Create Liability'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading} style={{ flex: 1 }}>
          Cancel
        </Button>
      </div>
    </form>
  );
}