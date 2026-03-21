import React, { useState, useEffect } from 'react';
import useLiability from '../hooks/useLiability';
import { Card, Badge, Button, Loader, ErrorDisplay, EmptyState } from '../components/ui';
import PageLayout from '../components/layout/PageLayout';
import AddLiabilityForm from '../components/forms/AddLiabilityForm';
import AddPaymentForm from '../components/forms/AddPaymentForm';

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function LiabilitiesPage() {
  const { liabilities, payments, loading, error, fetchLiabilities, fetchPayments, deleteLiability, deletePayment } = useLiability();
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'closed'

  useEffect(() => {
    fetchLiabilities();
    fetchPayments();
  }, []);

  const handleDeleteLiability = async (id) => {
    if (window.confirm('Delete this liability? This will also delete associated payment history.')) {
      const success = await deleteLiability(id);
      if (success) {
        await fetchLiabilities();
        await fetchPayments();
      }
    }
  };

  const handleDeletePayment = async (id) => {
    if (window.confirm('Delete this payment record?')) {
      const success = await deletePayment(id);
      if (success) {
        await fetchPayments();
      }
    }
  };

  const getLiabilityStatus = (liability) => {
    const liabilityPayments = payments.filter(p => p.liability === liability.id);
    const totalPaid = liabilityPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const remaining = Math.max(liability.principal_amount - totalPaid, 0);
    return {
      totalPaid,
      remaining,
      isClosed: remaining <= 0,
      progress: (totalPaid / liability.principal_amount) * 100
    };
  };

  const filtered = liabilities.filter(liability => {
    const { isClosed } = getLiabilityStatus(liability);
    if (filterStatus === 'active') return !isClosed;
    if (filterStatus === 'closed') return isClosed;
    return true;
  });

  const totalLiability = liabilities.reduce((sum, l) => sum + l.principal_amount, 0);
  const totalPaidAll = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalRemainingAll = liabilities.reduce((sum, l) => sum + getLiabilityStatus(l).remaining, 0);

  const calculateEMI = (principal, monthlyRate, tenure) => {
    if (monthlyRate === 0) return principal / tenure;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  };

  const getNextPaymentDue = (liability, payments) => {
    const liabilityPayments = payments.filter(p => p.liability === liability.id);
    if (liabilityPayments.length === 0) {
      return new Date(liability.start_date);
    }
    const lastPayment = liabilityPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))[0];
    const next = new Date(lastPayment.payment_date);
    next.setMonth(next.getMonth() + 1);
    return next;
  };

  if (loading) return <PageLayout title="Liabilities"><Loader /></PageLayout>;
  if (error) return <PageLayout title="Liabilities"><ErrorDisplay error={error} /></PageLayout>;

  return (
    <PageLayout title="Liabilities">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Liabilities</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {fmt(totalRemainingAll)} remaining • Paid: {fmt(totalPaidAll)}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="primary">
          {showForm ? 'Cancel' : '+ New Liability'}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: '2rem' }}>
          <AddLiabilityForm
            onSuccess={() => {
              setShowForm(false);
              fetchLiabilities();
            }}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Summary Cards */}
      {liabilities.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>Total Liability</p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '700' }}>
              {fmt(totalLiability)}
            </p>
          </Card>
          <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>Total Paid</p>
            <p style={{ margin: 0, color: 'var(--green)', fontSize: '1.3rem', fontWeight: '700' }}>
              {fmt(totalPaidAll)}
            </p>
          </Card>
          <Card style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500' }}>Remaining</p>
            <p style={{ margin: 0, color: 'var(--red)', fontSize: '1.3rem', fontWeight: '700' }}>
              {fmt(totalRemainingAll)}
            </p>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {['all', 'active', 'closed'].map(status => (
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
            {status.charAt(0).toUpperCase() + status.slice(1)} ({filtered.length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="💳"
          title={filterStatus === 'all' ? 'No liabilities yet' : `No ${filterStatus} liabilities`}
          message="Add a liability to track your debts and EMI payments"
        />
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filtered.map(liability => {
            const { totalPaid, remaining, isClosed, progress } = getLiabilityStatus(liability);
            const monthlyRate = liability.interest_rate / 100 / 12;
            const emi = calculateEMI(liability.principal_amount, monthlyRate, liability.tenure_months);
            const nextDue = getNextPaymentDue(liability, payments);
            const liabilityPayments = payments.filter(p => p.liability === liability.id);

            return (
              <Card key={liability.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      {liability.name}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {liability.liability_type}
                    </p>
                  </div>
                  <Badge color={isClosed ? 'green' : 'red'}>
                    {isClosed ? 'Closed' : 'Active'}
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Principal</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
                      {fmt(liability.principal_amount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monthly EMI</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
                      {fmt(emi)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Interest Rate</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
                      {liability.interest_rate}% p.a.
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tenure</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600' }}>
                      {liability.tenure_months} months
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Progress</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                      {fmt(totalPaid)} / {fmt(liability.principal_amount)} ({progress.toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '10px',
                    background: 'var(--surface-2)',
                    borderRadius: 'var(--radius)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: isClosed ? 'var(--green)' : 'var(--accent)',
                      borderRadius: 'var(--radius)',
                      transition: 'var(--transition)'
                    }} />
                  </div>
                  {remaining > 0 && (
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {fmt(remaining)} remaining
                    </p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Started</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {new Date(liability.start_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Next Payment Due</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {nextDue.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Button
                    onClick={() => {
                      setSelectedLiability(liability);
                      setShowPaymentForm(true);
                    }}
                    variant="primary"
                    disabled={isClosed}
                    style={{ flex: 1, opacity: isClosed ? 0.5 : 1 }}
                  >
                    + Add Payment
                  </Button>
                  <Button
                    onClick={() => handleDeleteLiability(liability.id)}
                    variant="ghost"
                    style={{ flex: 0.5 }}
                  >
                    Delete
                  </Button>
                </div>

                {/* Payment History */}
                {liabilityPayments.length > 0 && (
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                      Payment History ({liabilityPayments.length})
                    </p>
                    <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                      {liabilityPayments
                        .sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))
                        .map(payment => (
                          <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                {fmt(payment.amount)}
                              </p>
                              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                padding: '0.25rem 0.5rem',
                                opacity: 0.7,
                                transition: 'var(--transition)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.opacity = '1';
                                e.target.style.color = 'var(--red)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.opacity = '0.7';
                                e.target.style.color = 'var(--text-secondary)';
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentForm && selectedLiability && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <Card style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
              Add Payment to {selectedLiability.name}
            </h2>
            <AddPaymentForm
              liabilityId={selectedLiability.id}
              onSuccess={() => {
                setShowPaymentForm(false);
                setSelectedLiability(null);
                fetchPayments();
              }}
              onCancel={() => {
                setShowPaymentForm(false);
                setSelectedLiability(null);
              }}
            />
          </Card>
        </div>
      )}
    </PageLayout>
  );
}