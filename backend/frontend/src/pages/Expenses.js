import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import { Card, Badge, Loader, ErrorDisplay, EmptyState, Button } from "../components/ui";
import AddExpenseForm from "../components/forms/AddExpenseForm";
import useExpense from "../hooks/useExpense";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const CATEGORY_COLORS = {
  Food: "success", Travel: "default", Shopping: "purple",
  Bills: "warning", Entertainment: "danger", Health: "success",
  Education: "default", Groceries: "warning", Rent: "danger",
  Utilities: "warning", Other: "default",
};

const ExpensesPage = () => {
  const { expenses, loading, error, submitting, addExpense, deleteExpense } = useExpense();
  const [showForm, setShowForm] = useState(false);

  // Get user ID from localStorage (set during login)
  const userId = JSON.parse(localStorage.getItem("user") || "{}").id;

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <PageLayout activePath="/expenses">
      <TopBar
        title="Expenses"
        subtitle={`${expenses.length} records · Total: ${fmt(total)}`}
        onAdd={() => setShowForm(true)}
        addLabel="+ Add Expense"
      />
      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

        {showForm && (
          <Card title="Add New Expense">
            <AddExpenseForm
              userId={userId}
              onSubmit={async (payload) => {
                const result = await addExpense(payload);
                if (result.success) setShowForm(false);
                return result;
              }}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </Card>
        )}

        {loading && <Loader message="Loading expenses..." />}
        {error && <ErrorDisplay message={error} />}

        {!loading && !error && (
          <Card title="Expense Records">
            {expenses.length === 0 ? (
              <EmptyState
                icon="↙" title="No expenses yet"
                description="Start tracking your spending by adding an expense"
                action={<Button onClick={() => setShowForm(true)}>+ Add Expense</Button>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                  padding: "8px 16px", gap: 12,
                  borderBottom: "1px solid var(--border)",
                }}>
                  {["Description", "Category", "Method", "Amount", "Date", ""].map((h, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>{h}</span>
                  ))}
                </div>

                {expenses.map((expense) => (
                  <div key={expense.id} style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                    padding: "14px 16px", gap: 12, alignItems: "center",
                    borderBottom: "1px solid var(--border)",
                    transition: "background var(--transition)",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                      {expense.description || "—"}
                    </span>
                    <Badge variant={CATEGORY_COLORS[expense.category] || "default"}>
                      {expense.category}
                    </Badge>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {expense.payment_method}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--red)", fontFamily: "var(--font-mono)" }}>
                      {fmt(expense.amount)}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                      {new Date(expense.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
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

export default ExpensesPage;