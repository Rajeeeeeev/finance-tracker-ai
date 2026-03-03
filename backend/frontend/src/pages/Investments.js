import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import { Card, Badge, Loader, ErrorDisplay, EmptyState, Button } from "../components/ui";
import StatCard from "../components/ui/StatCard";
import AddInvestmentForm from "../components/forms/AddInvestmentForm";
import useInvestment from "../hooks/useInvestment";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const TYPE_LABELS = {
  EQUITY: "Equity", COMMODITY: "Commodity",
  BOND: "Bond", DEPOSIT: "Deposit", OTHER: "Other",
};

const InvestmentsPage = () => {
  const { investments, loading, error, submitting, addInvestment, deleteInvestment } = useInvestment();
  const [showForm, setShowForm] = useState(false);

  const totalInvested = investments.reduce((s, i) => s + Number(i.invested_amount), 0);
  const totalCurrent = investments.reduce((s, i) => s + Number(i.current_amount), 0);
  const totalGain = totalCurrent - totalInvested;

  return (
    <PageLayout activePath="/investments">
      <TopBar
        title="Investments"
        subtitle={`${investments.length} holdings`}
        onAdd={() => setShowForm(true)}
        addLabel="+ Add Investment"
      />
      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Summary Cards */}
        {!loading && investments.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <StatCard label="Total Invested" value={fmt(totalInvested)} accentColor="var(--accent)" icon="◎" />
            <StatCard label="Current Value" value={fmt(totalCurrent)} accentColor="var(--purple)" icon="↗" />
            <StatCard
              label="Total P&L" value={fmt(totalGain)}
              accentColor={totalGain >= 0 ? "var(--green)" : "var(--red)"}
              icon={totalGain >= 0 ? "↑" : "↓"}
            />
          </div>
        )}

        {showForm && (
          <Card title="Add New Investment">
            <AddInvestmentForm
              onSubmit={async (payload) => {
                const result = await addInvestment(payload);
                if (result.success) setShowForm(false);
                return result;
              }}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </Card>
        )}

        {loading && <Loader message="Loading investments..." />}
        {error && <ErrorDisplay message={error} />}

        {!loading && !error && (
          <Card title="Portfolio Holdings">
            {investments.length === 0 ? (
              <EmptyState
                icon="◎" title="No investments tracked yet"
                description="Add your first investment to start tracking your portfolio"
                action={<Button onClick={() => setShowForm(true)}>+ Add Investment</Button>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                  padding: "8px 16px", gap: 12, borderBottom: "1px solid var(--border)",
                }}>
                  {["Name", "Type", "Invested", "Current", "P&L", ""].map((h, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{h}</span>
                  ))}
                </div>

                {investments.map((inv) => {
                  const gain = Number(inv.profit_loss) || 0;
                  const gainPct = Number(inv.profit_loss_percentage) || 0;
                  return (
                    <div key={inv.id} style={{
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                      padding: "14px 16px", gap: 12, alignItems: "center",
                      borderBottom: "1px solid var(--border)",
                      transition: "background var(--transition)",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                          {inv.name}
                        </div>
                        {inv.symbol && (
                          <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            {inv.symbol}
                          </div>
                        )}
                      </div>
                      <Badge variant="default">{TYPE_LABELS[inv.investment_type] || inv.investment_type}</Badge>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {fmt(inv.invested_amount)}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {fmt(inv.current_amount)}
                      </span>
                      <div>
                        <span style={{
                          fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)",
                          color: gain >= 0 ? "var(--green)" : "var(--red)",
                        }}>
                          {gain >= 0 ? "+" : ""}{fmt(gain)}
                        </span>
                        <div style={{ fontSize: 11, color: gain >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-mono)" }}>
                          {gain >= 0 ? "↑" : "↓"} {Math.abs(gainPct).toFixed(2)}%
                        </div>
                      </div>
                      <button
                        onClick={() => deleteInvestment(inv.id)}
                        style={{
                          background: "var(--red-soft)", color: "var(--red)",
                          border: "none", borderRadius: "var(--radius-sm)",
                          padding: "4px 10px", fontSize: 11, fontWeight: 600,
                          fontFamily: "var(--font-mono)", cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </main>
    </PageLayout>
  );
};

export default InvestmentsPage;