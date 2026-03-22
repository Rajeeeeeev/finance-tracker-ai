import React, { useState, useEffect } from 'react';
import { useBillReminder } from '../hooks/useBillReminder';
import { Card, Badge, Button, Loader, ErrorDisplay, EmptyState } from '../components/ui';
import PageLayout from '../components/layout/PageLayout';
import AddBillReminderForm from '../components/forms/AddBillReminderForm';

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function BillRemindersPage() {
  const { reminders, loading, error, fetchReminders, markAsPaid, deleteReminder } = useBillReminder();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'paid'
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleMarkAsPaid = async (id) => {
    const result = await markAsPaid(id);

    if (result?.success) {
      let msg = '✅ Marked as paid — expense added to your records.';
      if (result.nextReminderCreated) {
        msg += ' Next month\'s reminder created automatically.';
      }
      showToast(msg, 'success');
    } else {
      showToast('❌ Failed to mark as paid. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this reminder?')) {
      const success = await deleteReminder(id);
      if (success) {
        showToast('Reminder deleted.', 'info');
      }
    }
  };

  const filtered = reminders.filter(r => {
    if (filterStatus === 'pending') return !r.is_paid;
    if (filterStatus === 'paid') return r.is_paid;
    return true;
  });

  const pendingCount = reminders.filter(r => !r.is_paid).length;
  const totalDue = reminders
    .filter(r => !r.is_paid)
    .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (reminder) => {
    if (reminder.is_paid) return 'green';
    const daysLeft = getDaysUntilDue(reminder.due_date);
    if (daysLeft < 0) return 'red';
    if (daysLeft <= 3) return 'yellow';
    return 'blue';
  };

  const getStatusLabel = (reminder) => {
    if (reminder.is_paid) return 'Paid';
    const daysLeft = getDaysUntilDue(reminder.due_date);
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)}d`;
    if (daysLeft === 0) return 'Due Today';
    if (daysLeft === 1) return 'Due Tomorrow';
    return `${daysLeft} days left`;
  };

  // Count per tab (fix: count from full list, not filtered)
  const tabCounts = {
    all: reminders.length,
    pending: reminders.filter(r => !r.is_paid).length,
    paid: reminders.filter(r => r.is_paid).length,
  };

  if (loading) return <PageLayout title="Bill Reminders"><Loader /></PageLayout>;
  if (error) return <PageLayout title="Bill Reminders"><ErrorDisplay message={error} /></PageLayout>;

  return (
    <PageLayout title="Bill Reminders">

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'error' ? 'var(--danger, #e53e3e)' : 'var(--success, #38a169)',
          color: 'white', padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm, 8px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          fontSize: '0.92rem', maxWidth: '360px',
          transition: 'opacity 0.3s',
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Bill Reminders</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {pendingCount} pending • Total due: {fmt(totalDue)}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ New Reminder'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: '2rem' }}>
          <AddBillReminderForm
            onSuccess={() => {
              setShowForm(false);
              fetchReminders();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {['all', 'pending', 'paid'].map(status => (
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
          icon="📋"
          title={filterStatus === 'all' ? 'No reminders yet' : `No ${filterStatus} reminders`}
          description="Create a new bill reminder to get started"
        />
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map(reminder => (
            <Card key={reminder.id} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {reminder.bill_name}
                  </h3>
                  {reminder.related_credit_card && (
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {reminder.related_credit_card.card_name} (****{reminder.related_credit_card.last_four_digits})
                    </p>
                  )}
                  {reminder.notes && (
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                      {reminder.notes}
                    </p>
                  )}
                </div>
                <Badge color={getStatusColor(reminder)}>
                  {getStatusLabel(reminder)}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Amount</p>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    {fmt(reminder.amount)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Due Date</p>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    {new Date(reminder.due_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Category</p>
                  <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>
                    {reminder.category}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!reminder.is_paid && (
                  <Button
                    onClick={() => handleMarkAsPaid(reminder.id)}
                    variant="primary"
                    style={{ flex: 1 }}
                  >
                    ✓ Mark as Paid
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(reminder.id)}
                  variant="ghost"
                  style={{ flex: reminder.is_paid ? 1 : 0.5 }}
                >
                  Delete
                </Button>
              </div>

              {reminder.is_recurring && (
                <p style={{ margin: '1rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  📅 Recurring {reminder.frequency}
                  {reminder.recurring_until_date && ` · Until ${new Date(reminder.recurring_until_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}