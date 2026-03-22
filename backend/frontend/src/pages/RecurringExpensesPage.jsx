import React, { useState, useEffect } from 'react';
import { useRecurringExpense } from '../hooks/useRecurringExpense';
import { Card, Badge, Button, Loader, ErrorDisplay, EmptyState } from '../components/ui';
import PageLayout from '../components/layout/PageLayout';
import AddRecurringExpenseForm from '../components/forms/AddRecurringExpenseForm';

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

// FIXED: keys must match backend UPPERCASE values from RecurringExpense.FREQUENCY_CHOICES
const FREQUENCY_LABELS = {
  'DAILY':   'Daily',
  'WEEKLY':  'Weekly',
  'MONTHLY': 'Monthly',
  'YEARLY':  'Yearly',
};

// FIXED: switch cases use UPPERCASE to match backend
const getNextOccurrence = (lastGeneratedDate, frequency) => {
  const base = lastGeneratedDate ? new Date(lastGeneratedDate) : new Date();
  const next = new Date(base);

  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      return base;
  }

  return next;
};

// FIXED: frequency keys UPPERCASE for monthly estimate
const getMonthlyEquivalent = (amount, frequency) => {
  const amt = parseFloat(amount) || 0;
  switch (frequency) {
    case 'DAILY':   return amt * 30;
    case 'WEEKLY':  return amt * 4.33;
    case 'MONTHLY': return amt;
    case 'YEARLY':  return amt / 12;
    default:        return amt;
  }
};

export default function RecurringExpensesPage() {
  const { recurringExpenses, loading, error, fetchRecurringExpenses, deleteRecurringExpense, toggleActive } = useRecurringExpense();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'

  useEffect(() => {
    fetchRecurringExpenses();
  }, [fetchRecurringExpenses]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this recurring expense template? This will NOT delete already-generated expenses.')) {
      const success = await deleteRecurringExpense(id);
      if (success) await fetchRecurringExpenses();
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const success = await toggleActive(id, !currentStatus);
    if (success) await fetchRecurringExpenses();
  };

  const filtered = recurringExpenses.filter(re => {
    if (filterStatus === 'active') return re.is_active;
    if (filterStatus === 'inactive') return !re.is_active;
    return true;
  });

  const activeCount = recurringExpenses.filter(r => r.is_active).length;

  const monthlyEstimate = recurringExpenses
    .filter(r => r.is_active)
    .reduce((sum, r) => sum + getMonthlyEquivalent(r.amount, r.frequency), 0);

  // Tab counts from full list, not filtered
  const tabCounts = {
    all: recurringExpenses.length,
    active: recurringExpenses.filter(r => r.is_active).length,
    inactive: recurringExpenses.filter(r => !r.is_active).length,
  };

  const getStatusVariant = (isActive) => isActive ? 'success' : 'default';

  if (loading) return <PageLayout title="Recurring Expenses"><Loader /></PageLayout>;
  if (error) return <PageLayout title="Recurring Expenses"><ErrorDisplay message={error} /></PageLayout>;

  return (
    <PageLayout title="Recurring Expenses">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Recurring Expenses</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {activeCount} active • Est. monthly: {fmt(monthlyEstimate)}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ New Template'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: '2rem' }}>
          <AddRecurringExpenseForm
            onSuccess={() => {
              setShowForm(false);
              fetchRecurringExpenses();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {['all', 'active', 'inactive'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '0.5rem 1rem',
              background: filterStatus === status ? 'var(--accent)' : 'transparent',
              color: filterStatus === status ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: filterStatus === status ? '600' : '400',
              transition: 'var(--transition)'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({tabCounts[status]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔄"
          title={filterStatus === 'all' ? 'No recurring expenses yet' : `No ${filterStatus} templates`}
          description="Create a recurring expense template to automate your monthly expenses"
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map(recurring => {
            const nextDate = getNextOccurrence(recurring.last_generated_date, recurring.frequency);
            const isNextSoon = (nextDate - new Date()) < 3 * 24 * 60 * 60 * 1000;

            return (
              <Card key={recurring.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      {recurring.title}
                    </h3>
                    <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {recurring.category} · {recurring.payment_method}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(recurring.is_active)}>
                    {recurring.is_active ? 'Active' : 'Paused'}
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                      {fmt(recurring.amount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Frequency</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      {/* FIXED: looks up UPPERCASE key */}
                      {FREQUENCY_LABELS[recurring.frequency] || recurring.frequency}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Next Occurrence</p>
                    <p style={{ margin: 0, color: isNextSoon ? 'var(--warning, orange)' : 'var(--text-primary)', fontSize: '1rem', fontWeight: isNextSoon ? '600' : '400' }}>
                      {nextDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {isNextSoon && ' ⚠️'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                    variant={recurring.is_active ? 'secondary' : 'primary'}
                    style={{ flex: 1 }}
                  >
                    {recurring.is_active ? '⏸ Pause' : '▶ Resume'}
                  </Button>
                  <Button
                    onClick={() => handleDelete(recurring.id)}
                    variant="danger"
                    style={{ flex: 0.5 }}
                  >
                    Delete
                  </Button>
                </div>

                <p style={{ margin: '1rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  Last generated: {recurring.last_generated_date
                    ? new Date(recurring.last_generated_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Never (will run next scheduled cycle)'}
                </p>
              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}