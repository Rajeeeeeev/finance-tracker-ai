import React, { useState, useEffect } from 'react';
import { useSavings } from '../hooks/useSavings';
import { Card, Badge, Button, Loader, ErrorDisplay, EmptyState } from '../components/ui';
import PageLayout from '../components/layout/PageLayout';
import AddSavingGoalForm from '../components/forms/AddSavingGoalForm';
import AddSavingEntryForm from '../components/forms/AddSavingEntryForm';

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

export default function SavingsPage() {
  const { goals, entries, loading, error, fetchGoals, fetchEntries, deleteGoal, deleteEntry } = useSavings();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchGoals();
    fetchEntries();
  }, []);

  const handleDeleteGoal = async (id) => {
    if (window.confirm('Delete this savings goal?')) {
      const success = await deleteGoal(id);
      if (success) {
        await fetchGoals();
      }
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Delete this entry?')) {
      const success = await deleteEntry(id);
      if (success) {
        await fetchEntries();
      }
    }
  };

  const getGoalProgress = (goal) => {
    const goalEntries = entries.filter(e => e.goal === goal.id);
    const totalSaved = goalEntries.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const targetAmount = parseFloat(goal.target_amount) || 0;
    const progress = targetAmount > 0 ? (totalSaved / targetAmount) * 100 : 0;
    return {
      totalSaved,
      progress: Math.min(progress, 100),
      remaining: Math.max(targetAmount - totalSaved, 0),
      isCompleted: totalSaved >= targetAmount
    };
  };

  const filtered = goals.filter(goal => {
    const { isCompleted } = getGoalProgress(goal);
    if (filterStatus === 'active') return !isCompleted;
    if (filterStatus === 'completed') return isCompleted;
    return true;
  });

  const totalTarget = goals.reduce((sum, g) => sum + (parseFloat(g.target_amount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + getGoalProgress(g).totalSaved, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const getStatusVariant = (isCompleted) => {
    return isCompleted ? 'success' : 'default';
  };

  const daysUntilDeadline = (deadline) => {
    if (!deadline) return 0;
    const dead = new Date(deadline);
    if (isNaN(dead.getTime())) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dead.setHours(0, 0, 0, 0);
    const diff = Math.ceil((dead - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) return <PageLayout title="Savings"><Loader /></PageLayout>;
  if (error) return <PageLayout title="Savings"><ErrorDisplay message={error} /></PageLayout>;

  return (
    <PageLayout title="Savings">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Savings Goals</h2>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {fmt(totalSaved)} of {fmt(totalTarget)} saved ({overallProgress.toFixed(1)}%)
          </p>
        </div>
        <Button onClick={() => setShowGoalForm(!showGoalForm)} variant="primary">
          {showGoalForm ? 'Cancel' : '+ New Goal'}
        </Button>
      </div>

      {showGoalForm && (
        <Card style={{ marginBottom: '2rem' }}>
          <AddSavingGoalForm
            onSuccess={() => {
              setShowGoalForm(false);
              fetchGoals();
            }}
            onCancel={() => setShowGoalForm(false)}
          />
        </Card>
      )}

      {goals.length > 0 && (
        <Card style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>Overall Progress</h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600' }}>
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${overallProgress}%`,
              height: '100%',
              background: 'var(--green)',
              borderRadius: 'var(--radius)',
              transition: 'var(--transition)'
            }} />
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        {['all', 'active', 'completed'].map(status => (
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
          icon="🎯"
          title={filterStatus === 'all' ? 'No savings goals yet' : `No ${filterStatus} goals`}
          description="Create a savings goal to start tracking your progress"
        />
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filtered.map(goal => {
            const { totalSaved, progress, remaining, isCompleted } = getGoalProgress(goal);
            const daysLeft = daysUntilDeadline(goal.end_date);

            return (
              <Card key={goal.id} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      {goal.name}
                    </h3>
                  </div>
                  <Badge variant={getStatusVariant(isCompleted)}>
                    {isCompleted ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Target Amount</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                      {fmt(goal.target_amount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deadline</p>
                    <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem' }}>
                      {new Date(goal.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {daysLeft > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> ({daysLeft} days)</span>}
                      {daysLeft <= 0 && <span style={{ color: 'var(--red)', fontSize: '0.85rem' }}> (Overdue)</span>}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Progress</span>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                      {fmt(totalSaved)} / {fmt(goal.target_amount)} ({progress.toFixed(1)}%)
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
                      background: isCompleted ? 'var(--green)' : 'var(--accent)',
                      borderRadius: 'var(--radius)',
                      transition: 'var(--transition)'
                    }} />
                  </div>
                  {remaining > 0 && (
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {fmt(remaining)} more to go
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setShowEntryForm(true);
                    }}
                    variant="primary"
                    style={{ flex: 1 }}
                  >
                    + Add Entry
                  </Button>
                  <Button
                    onClick={() => handleDeleteGoal(goal.id)}
                    variant="ghost"
                    style={{ flex: 0.5 }}
                  >
                    Delete
                  </Button>
                </div>

                {entries.filter(e => e.goal === goal.id).length > 0 && (
                  <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                      Recent Entries
                    </p>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {entries
                        .filter(e => e.goal === goal.id)
                        .slice(0, 3)
                        .map(entry => (
                          <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }}>
                            <div>
                              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: '500' }}>
                                {fmt(entry.amount)}
                              </p>
                              <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {new Date(entry.date).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
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

      {showEntryForm && selectedGoal && (
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
              Add Entry to {selectedGoal.name}
            </h2>
            <AddSavingEntryForm
              goalId={selectedGoal.id}
              goalName={selectedGoal.name}
              onSuccess={() => {
                setShowEntryForm(false);
                setSelectedGoal(null);
                fetchEntries();
              }}
              onCancel={() => {
                setShowEntryForm(false);
                setSelectedGoal(null);
              }}
            />
          </Card>
        </div>
      )}
    </PageLayout>
  );
}