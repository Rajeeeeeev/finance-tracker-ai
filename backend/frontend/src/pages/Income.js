import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import { Card, Badge, Loader, ErrorDisplay, EmptyState, Button } from "../components/ui";
import AddIncomeForm from "../components/forms/AddIncomeForm";
import useIncome from "../hooks/useIncome";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const INCOME_TYPE_LABELS = {
  SALARY: "Salary", BUSINESS: "Business",
  INVESTMENT_RETURN: "Investment Return", RENTAL: "Rental", OTHER: "Other",
};

const IncomePage = () => {
  const { incomes, loading, error, submitting, addIncome, deleteIncome } = useIncome();
  const [showForm, setShowForm] = useState(false);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <PageLayout activePath="/income">
      <TopBar
        title="Income"
        subtitle={`${incomes.length} records · Total: ${fmt(totalIncome)}`}
        onAdd={() => setShowForm(true)}
        addLabel="+ Add Income"
      />
      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

        {showForm && (
          <Card title="Add New Income">
            <AddIncomeForm
              onSubmit={async (payload) => {
                const result = await addIncome(payload);
                if (result.success) setShowForm(false);
                return result;
              }}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </Card>
        )}

        {loading && <Loader message="Loading income records..." />}
        {error && <ErrorDisplay message={error} />}

        {!loading && !error && (
          <Card title="Income Records">
            {incomes.length === 0 ? (
              <EmptyState
                icon="↗" title="No income records yet"
                description="Add your first income entry to get started"
                action={<Button onClick={() => setShowForm(true)}>+ Add Income</Button>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                  padding: "8px 16px", gap: 12,
                  borderBottom: "1px solid var(--border)",
                }}>
                  {["Source", "Type", "Amount", "Date", ""].map((h, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{h}</span>
                  ))}
                </div>

                {incomes.map((income) => (
                  <div key={income.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                    padding: "14px 16px", gap: 12, alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    transition: "background var(--transition)",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                      {income.source_name}
                    </span>
                    <Badge variant="success">
                      {INCOME_TYPE_LABELS[income.income_type] || income.income_type}
                    </Badge>
                    <span style={{
                      fontSize: 14, fontWeight: 600, color: "var(--green)",
                      fontFamily: "var(--font-mono)",
                    }}>
                      {fmt(income.amount)}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {new Date(income.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => deleteIncome(income.id)}
                      style={{
                        background: "var(--red-soft)", color: "var(--red)",
                        border: "none", borderRadius: "var(--radius-sm)",
                        padding: "4px 10px", fontSize: 11, fontWeight: 600,
                        fontFamily: "var(--font-mono)", cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
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

export default IncomePage;