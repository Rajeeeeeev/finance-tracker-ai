import React, { useState, useEffect } from 'react';
import useLiability from '../hooks/useLiability';
import { Card, Badge, Button, Loader, ErrorDisplay, EmptyState } from '../components/ui';
import PageLayout from '../components/layout/PageLayout';
import AddLiabilityForm from '../components/forms/AddLiabilityForm';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

// FIXED: use remaining_principal from backend, not recalculated from payments
const getLiabilityStatus = (liability) => {
  const principal = parseFloat(liability.principal_amount) || 0;
  const remaining = parseFloat(liability.remaining_principal) || 0;
  const paid = principal - remaining;
  const progress = principal > 0 ? (paid / principal) * 100 : 0;
  const isClosed = !liability.is_active;
  return { paid, remaining, progress, isClosed };
};

// Loan type icons
const TYPE_META = {
  HOME_LOAN:       { icon: '🏠', label: 'Home Loan',       color: '#4f8ef7' },
  CAR_LOAN:        { icon: '🚗', label: 'Car Loan',         color: '#f7a84f' },
  EDUCATION_LOAN:  { icon: '🎓', label: 'Education Loan',   color: '#9b59b6' },
  PERSONAL_LOAN:   { icon: '👤', label: 'Personal Loan',    color: '#1abc9c' },
  CREDIT_CARD:     { icon: '💳', label: 'Credit Card',      color: '#e74c3c' },
  OTHER:           { icon: '📋', label: 'Other',            color: '#95a5a6' },
};

// Format tenure in human-readable form
const formatTenure = (months) => {
  if (!months) return '—';
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo} mo`;
  if (mo === 0) return `${yrs} yr`;
  return `${yrs} yr ${mo} mo`;
};

export default function LiabilitiesPage() {
  const { liabilities, loading, error, fetchLiabilities, payEMI, deleteLiability, closeLiability } = useLiability();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');
  const [payingId, setPayingId] = useState(null);   // tracks which card is in loading state
  const [closingId, setClosingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null); // expanded EMI history
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchLiabilities();
  }, [fetchLiabilities]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Pay EMI — no form needed, backend calculates everything
  const handlePayEMI = async (liability) => {
    if (!window.confirm(`Pay EMI of ${fmt(liability.emi_amount)} for "${liability.name}"?`)) return;
    setPayingId(liability.id);
    const result = await payEMI(liability.id);
    setPayingId(null);
    if (result.success) {
      showToast(`✅ EMI of ${fmt(liability.emi_amount)} paid. Expense recorded automatically.`);
    } else {
      showToast(`❌ ${result.error}`, 'error');
    }
  };

  const handleClose = async (liability) => {
    if (!window.confirm(`Mark "${liability.name}" as fully closed? This cannot be undone.`)) return;
    setClosingId(liability.id);
    const result = await closeLiability(liability.id);
    setClosingId(null);
    if (result.success) {
      showToast(`✅ "${liability.name}" marked as closed.`);
    } else {
      showToast(`❌ ${result.error}`, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const success = await deleteLiability(id);
    if (success) {
      showToast('Liability deleted.', 'info');
    }
  };

  // Summary numbers — FIXED: use remaining_principal not principal_amount
  const activeLiabilities = liabilities.filter(l => l.is_active);
  const totalRemaining = activeLiabilities.reduce((sum, l) => sum + parseFloat(l.remaining_principal || 0), 0);
  const totalMonthlyEMI = activeLiabilities.reduce((sum, l) => sum + parseFloat(l.emi_amount || 0), 0);
  const totalPrincipal = activeLiabilities.reduce((sum, l) => sum + parseFloat(l.principal_amount || 0), 0);
  const totalPaid = totalPrincipal - totalRemaining;
  const overallProgress = totalPrincipal > 0 ? (totalPaid / totalPrincipal) * 100 : 0;

  // Tab counts
  const tabCounts = {
    active: liabilities.filter(l => l.is_active).length,
    closed: liabilities.filter(l => !l.is_active).length,
    all: liabilities.length,
  };

  const filtered = liabilities.filter(l => {
    if (filterStatus === 'active') return l.is_active;
    if (filterStatus === 'closed') return !l.is_active;
    return true;
  });

  if (loading) return <PageLayout title="Liabilities"><Loader /></PageLayout>;
  if (error) return <PageLayout title="Liabilities"><ErrorDisplay message={error} /></PageLayout>;

  return (
    <PageLayout title="Liabilities">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'error' ? 'var(--red, #e53e3e)' : toast.type === 'info' ? 'var(--text-secondary)' : 'var(--green, #38a169)',
          color: 'white', padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-sm)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          fontSize: '0.92rem', maxWidth: '380px',
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Liabilities</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {activeLiabilities.length} active loan{activeLiabilities.length !== 1 ? 's' : ''} •
            Monthly EMI burden: <strong style={{ color: 'var(--text-primary)' }}>{fmt(totalMonthlyEMI)}</strong>
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ New Liability'}
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card style={{ marginBottom: '2rem' }}>
          <AddLiabilityForm
            onSuccess={() => { setShowForm(false); fetchLiabilities(); }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Summary Cards — FIXED: shows remaining, not original principal */}
      {activeLiabilities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <Card style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Amount Owed
            </p>
            <p style={{ margin: 0, color: 'var(--red, #e53e3e)', fontSize: '1.25rem', fontWeight: '700' }}>
              {fmt(totalRemaining)}
            </p>
          </Card>
          <Card style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Paid
            </p>
            <p style={{ margin: 0, color: 'var(--green, #38a169)', fontSize: '1.25rem', fontWeight: '700' }}>
              {fmt(totalPaid)}
            </p>
          </Card>
          <Card style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Monthly EMI
            </p>
            <p style={{ margin: 0, color: 'var(--accent)', fontSize: '1.25rem', fontWeight: '700' }}>
              {fmt(totalMonthlyEMI)}
            </p>
          </Card>
          <Card style={{ padding: '1.25rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Overall Progress
            </p>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>
              {overallProgress.toFixed(1)}%
            </p>
            <div style={{ width: '100%', height: '6px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${overallProgress}%`, height: '100%', background: 'var(--accent)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
            </div>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {['active', 'closed', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: '0.5rem 1rem',
              background: filterStatus === status ? 'var(--accent)' : 'transparent',
              color: filterStatus === status ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontSize: '0.9rem',
              fontWeight: filterStatus === status ? '600' : '400',
              transition: 'var(--transition)'
            }}
          >
            {/* FIXED: each tab shows its own count */}
            {status.charAt(0).toUpperCase() + status.slice(1)} ({tabCounts[status]})
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="💳"
          title={filterStatus === 'all' ? 'No liabilities yet' : `No ${filterStatus} liabilities`}
          description={filterStatus === 'active' ? 'Add a loan or EMI to start tracking' : 'Closed loans will appear here'}
        />
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filtered.map(liability => {
            const { paid, remaining, progress, isClosed } = getLiabilityStatus(liability);
            const meta = TYPE_META[liability.liability_type] || TYPE_META.OTHER;
            const isPaying = payingId === liability.id;
            const isClosing = closingId === liability.id;
            const isExpanded = expandedId === liability.id;

            // Months remaining label
            const remainingMonths = liability.remaining_months || 0;
            const remainingLabel = formatTenure(remainingMonths);

            return (
              <Card key={liability.id} style={{ padding: '1.5rem', borderLeft: `4px solid ${meta.color}` }}>

                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                    <span style={{
                      fontSize: '1.75rem',
                      background: 'var(--surface-2)',
                      borderRadius: '50%',
                      width: '3rem', height: '3rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {meta.icon}
                    </span>
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '600' }}>
                        {liability.name}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--surface-2)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <Badge variant={isClosed ? 'default' : 'success'}>
                    {isClosed ? 'Closed' : 'Active'}
                  </Badge>
                </div>

                {/* Key Stats — 4 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Monthly EMI</p>
                    {/* FIXED: use backend emi_amount, not recalculated value */}
                    <p style={{ margin: 0, color: 'var(--accent)', fontSize: '1.05rem', fontWeight: '700' }}>
                      {fmt(liability.emi_amount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Interest Rate</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '600' }}>
                      {liability.interest_rate}% p.a.
                    </p>
                  </div>
                  <div>
                    {/* FIXED: show tenure in years, not raw months */}
                    <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tenure</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '600' }}>
                      {formatTenure(liability.tenure_months)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Remaining</p>
                    <p style={{ margin: 0, color: isClosed ? 'var(--green, #38a169)' : 'var(--text-primary)', fontSize: '1.05rem', fontWeight: '600' }}>
                      {isClosed ? '—' : remainingLabel}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Repayment Progress</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '600' }}>
                      {fmt(paid)} paid • {fmt(remaining)} left ({progress.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(progress, 100)}%`,
                      height: '100%',
                      background: isClosed ? 'var(--green, #38a169)' : meta.color,
                      borderRadius: '999px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>

                {/* Dates row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Start Date</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                      {new Date(liability.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>End Date</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                      {liability.end_date
                        ? new Date(liability.end_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.2rem 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Total Interest</p>
                    <p style={{ margin: 0, color: 'var(--red, #e53e3e)', fontSize: '0.9rem', fontWeight: '600' }}>
                      {fmt(liability.total_interest)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isClosed && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    {/* FIXED: direct Pay EMI — no form, backend handles everything */}
                    <Button
                      onClick={() => handlePayEMI(liability)}
                      variant="primary"
                      disabled={isPaying || isClosing}
                      style={{ flex: 2 }}
                    >
                      {isPaying ? '⏳ Processing...' : `💸 Pay EMI  ${fmt(liability.emi_amount)}`}
                    </Button>
                    <Button
                      onClick={() => handleClose(liability)}
                      variant="secondary"
                      disabled={isPaying || isClosing}
                      style={{ flex: 1 }}
                    >
                      {isClosing ? '⏳...' : '🔒 Close Loan'}
                    </Button>
                    <Button
                      onClick={() => handleDelete(liability.id, liability.name)}
                      variant="ghost"
                      disabled={isPaying || isClosing}
                      style={{ flex: 0.6 }}
                    >
                      Delete
                    </Button>
                  </div>
                )}

                {isClosed && (
                  <div style={{ marginBottom: '1rem' }}>
                    <Button
                      onClick={() => handleDelete(liability.id, liability.name)}
                      variant="ghost"
                      style={{ width: '100%' }}
                    >
                      Delete Record
                    </Button>
                  </div>
                )}

                {/* Toggle EMI History */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : liability.id)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>📋 EMI Payment History</span>
                  <span>{isExpanded ? '▲ Hide' : '▼ Show'}</span>
                </button>

                {/* EMI History — principal/interest split shown */}
                {isExpanded && (
                  <EMIHistory liabilityId={liability.id} />
                )}

              </Card>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}


// ─────────────────────────────────────────────
// EMI History Sub-component
// Fetches from GET /<id>/payments/ and shows
// principal + interest split per payment
// ─────────────────────────────────────────────
function EMIHistory({ liabilityId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);

  useEffect(() => {
    const load = async () => {
      try {
        const { liabilityService } = await import('../api/services/liabilityService');
        const data = await liabilityService.getPaymentHistory(liabilityId);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [liabilityId]);

  if (loading) return <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading history...</div>;
  if (error) return <div style={{ padding: '1rem', color: 'var(--red)', fontSize: '0.85rem' }}>{error}</div>;
  if (history.length === 0) return <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No EMI payments recorded yet.</div>;

  return (
    <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto' }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.5rem 0.75rem' }}>
        {['Date', 'Total EMI', '→ Principal', '→ Interest'].map(h => (
          <p key={h} style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</p>
        ))}
      </div>
      {history.map((payment, i) => (
        <div key={payment.id || i} style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '0.5rem',
          padding: '0.65rem 0.75rem',
          background: 'var(--surface-2)',
          borderRadius: 'var(--radius-sm)',
          alignItems: 'center'
        }}>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
            {new Date(payment.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: '600' }}>
            {fmt(payment.amount)}
          </p>
          {/* IMPROVED: show principal/interest split */}
          <p style={{ margin: 0, color: 'var(--green, #38a169)', fontSize: '0.85rem', fontWeight: '500' }}>
            {fmt(payment.principal_component)}
          </p>
          <p style={{ margin: 0, color: 'var(--red, #e53e3e)', fontSize: '0.85rem', fontWeight: '500' }}>
            {fmt(payment.interest_component)}
          </p>
        </div>
      ))}
    </div>
  );
}