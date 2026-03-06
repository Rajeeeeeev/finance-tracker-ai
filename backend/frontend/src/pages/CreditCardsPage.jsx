import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import { Card, Badge, Loader, ErrorDisplay, EmptyState, Button } from "../components/ui";
import AddCreditCardForm from "../components/forms/AddCreditCardForm";
import useCreditCard from "../hooks/useCreditCard";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const NETWORK_COLORS = {
  Visa: "default", Mastercard: "danger", RuPay: "success", Amex: "purple", Other: "warning",
};

// Utilization bar — green < 30%, yellow 30-70%, red > 70%
const UtilizationBar = ({ percent }) => {
  const color = percent < 30 ? "var(--green)" : percent < 70 ? "var(--yellow)" : "var(--red)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Utilization
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: "var(--font-mono)" }}>
          {percent}%
        </span>
      </div>
      <div style={{
        height: 6, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${Math.min(percent, 100)}%`,
          background: color, borderRadius: 99,
          transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
};

const CreditCardsPage = () => {
  const { cards, summary, loading, error, submitting, addCard, deleteCard } = useCreditCard();
  const [showForm, setShowForm] = useState(false);

  return (
    <PageLayout activePath="/credit-cards">
      <TopBar
        title="Credit Cards"
        subtitle={
          summary
            ? `${cards.length} card${cards.length !== 1 ? "s" : ""} · Total balance: ${fmt(summary.total_balance)} · Available: ${fmt(summary.total_available)}`
            : `${cards.length} card${cards.length !== 1 ? "s" : ""}`
        }
        onAdd={() => setShowForm(true)}
        addLabel="+ Add Card"
      />

      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Add Card Form */}
        {showForm && (
          <Card title="Add New Credit Card">
            <AddCreditCardForm
              onSubmit={async (payload) => {
                const result = await addCard(payload);
                if (result.success) setShowForm(false);
                return result;
              }}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </Card>
        )}

        {loading && <Loader message="Loading credit cards..." />}
        {error && <ErrorDisplay message={error} />}

        {/* Overall Summary Bar */}
        {!loading && summary && cards.length > 0 && (
          <Card title="Overall Summary">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
              {[
                { label: "Total Limit",     value: fmt(summary.total_credit_limit), color: "var(--text-primary)" },
                { label: "Total Spent",     value: fmt(summary.total_balance),      color: "var(--red)" },
                { label: "Total Available", value: fmt(summary.total_available),    color: "var(--green)" },
                { label: "Utilization",     value: `${summary.overall_utilization}%`,
                  color: summary.overall_utilization < 30 ? "var(--green)"
                       : summary.overall_utilization < 70 ? "var(--yellow)" : "var(--red)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>{label}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Cards List */}
        {!loading && !error && (
          <Card title="Your Cards">
            {cards.length === 0 ? (
              <EmptyState
                icon="💳"
                title="No credit cards yet"
                description="Add a credit card to start tracking your spending and utilization"
                action={<Button onClick={() => setShowForm(true)}>+ Add Card</Button>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {cards.map((card) => (
                  <div key={card.id} style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px 24px",
                    display: "flex", flexDirection: "column", gap: 16,
                    background: "var(--surface-1)",
                    transition: "background var(--transition)",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-1)")}
                  >
                    {/* Top row: card info + delete */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{
                            fontSize: 16, fontWeight: 700,
                            color: "var(--text-primary)", fontFamily: "var(--font-display)",
                          }}>
                            {card.card_name}
                          </span>
                          <Badge variant={NETWORK_COLORS[card.card_network] || "default"}>
                            {card.card_network}
                          </Badge>
                        </div>
                        <span style={{
                          fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
                        }}>
                          {card.bank_name} · ****{card.last_four_digits}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteCard(card.id)}
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

                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Credit Limit",  value: fmt(card.credit_limit),     color: "var(--text-primary)" },
                        { label: "Spent",         value: fmt(card.current_balance),   color: "var(--red)" },
                        { label: "Available",     value: fmt(card.available_credit),  color: "var(--green)" },
                        { label: "Min. Due",      value: fmt(card.minimum_due),       color: "var(--yellow)" },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                          }}>{label}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color, fontFamily: "var(--font-mono)" }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Utilization bar */}
                    <UtilizationBar percent={card.utilization_percent} />

                    {/* Due date footer */}
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      paddingTop: 8, borderTop: "1px solid var(--border)",
                    }}>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Billing date: {card.billing_date} of every month
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                        Next due: <strong style={{ color: "var(--text-primary)" }}>{card.next_due_date}</strong>
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

      </main>
    </PageLayout>
  );
};

export default CreditCardsPage;