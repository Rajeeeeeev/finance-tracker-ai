import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import StatCard from "../components/ui/StatCard";
import { Card, Badge, Loader, ErrorDisplay } from "../components/ui";
import { IncomeVsExpenseChart, NetWorthTrendChart, ExpenseCategoryChart } from "../components/charts";
import useFinancialSummary from "../hooks/useFinancialSummary";
import { useAnalytics } from "../hooks/useAnalytics";

// ─── FORMATTER ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const pct = (a, b) => (b && b !== 0 ? ((Number(a) / Number(b)) * 100).toFixed(1) : "0.0");

// ─── FILTER CONTROL ───────────────────────────────────────────────────────────
const FilterBar = ({ mode, onCurrentMonth, onSpecificMonth, onCustomRange }) => {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const btnStyle = (active) => ({
    background: active ? "var(--accent)" : "transparent",
    color: active ? "#fff" : "var(--text-secondary)",
    border: "none", borderRadius: 7,
    padding: "7px 14px", fontSize: 12, fontWeight: 600,
    fontFamily: "var(--font-mono)", cursor: "pointer",
    transition: "all var(--transition)", letterSpacing: "0.02em",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{
        display: "flex", background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: 10, padding: 3, gap: 2,
      }}>
        <button style={btnStyle(mode === "current_month")}
          onClick={() => { onCurrentMonth(); setShowMonthPicker(false); setShowRangePicker(false); }}>
          This Month
        </button>
        <button style={btnStyle(mode === "specific_month")}
          onClick={() => { setShowMonthPicker(true); setShowRangePicker(false); }}>
          Pick Month
        </button>
        <button style={btnStyle(mode === "custom_range")}
          onClick={() => { setShowRangePicker(true); setShowMonthPicker(false); }}>
          Custom
        </button>
      </div>

      {showMonthPicker && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            style={{ width: "auto", padding: "7px 10px", fontSize: 12 }}>
            {[2023,2024,2025,2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            style={{ width: "auto", padding: "7px 10px", fontSize: 12 }}>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
              .map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <button onClick={() => { onSpecificMonth(year, month); setShowMonthPicker(false); }}
            style={{ background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 600,
              fontFamily: "var(--font-mono)", cursor: "pointer" }}>
            Apply
          </button>
        </div>
      )}

      {showRangePicker && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            style={{ width: "auto", padding: "7px 10px", fontSize: 12 }} />
          <span style={{ color: "var(--text-muted)", fontSize: 12 }}>→</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            style={{ width: "auto", padding: "7px 10px", fontSize: 12 }} />
          <button onClick={() => { if (startDate && endDate) { onCustomRange(startDate, endDate); setShowRangePicker(false); } }}
            style={{ background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: 7, padding: "7px 12px", fontSize: 12, fontWeight: 600,
              fontFamily: "var(--font-mono)", cursor: "pointer" }}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

// ─── BREAKDOWN BAR ────────────────────────────────────────────────────────────
const BreakdownBar = ({ label, value, total, color }) => {
  const w = total ? Math.min((Number(value) / Number(total)) * 100, 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          width: `${w}%`, height: "100%", background: color,
          borderRadius: 4, transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }} />
      </div>
    </div>
  );
};

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const {
    data, loading, error,
    filterMode, applyCurrentMonth, applySpecificMonth, applyCustomRange,
  } = useFinancialSummary();
const { 
  monthlyTrend, 
  categoryData: analyticsCategory,
  setSelectedYear,
  setSelectedMonth
} = useAnalytics();
  const now = new Date();
  const periodLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  if (loading) return (
    <PageLayout activePath="/">
      <TopBar title="Financial Overview" subtitle={periodLabel} />
      <main style={{ padding: "32px", flex: 1 }}><Loader message="Fetching your financial data..." /></main>
    </PageLayout>
  );

  if (error) return (
    <PageLayout activePath="/">
      <TopBar title="Financial Overview" />
      <main style={{ padding: "32px" }}><ErrorDisplay message={error} /></main>
    </PageLayout>
  );

  const savingsRate = pct(data.total_savings, data.total_income);
  const totalExpAll = Number(data.total_expenses) + Number(data.total_recurring_expenses);
  const investmentGain = Number(data.total_investment_current_value) - Number(data.total_invested);

  // Build expense categories from bills data for the pie chart
  // (In Phase 2 you'll add a dedicated endpoint for this breakdown)
  const categoryData = [
    { name: "Direct Expenses",   value: Number(data.total_expenses) },
    { name: "Recurring",         value: Number(data.total_recurring_expenses) },
    { name: "Liability EMIs",    value: Number(data.total_liability_payments) },
  ].filter((d) => d.value > 0);

  const chartData = (monthlyTrend || []).map((m) => ({
  month: m.label,
  income: m.income,
  expense: m.expenses,
}));

const netWorthData = chartData.map((d) => ({
  month: d.month,
  netWorth: d.income - d.expense,
}));

const categoryChartData = (analyticsCategory?.breakdown || []).map((c) => ({
  name: c.category,
  value: c.amount,
}));

  return (
    <PageLayout activePath="/">
      <TopBar
        title="Financial Overview"
        subtitle={data.period || periodLabel}
        filterSlot={
          <FilterBar
            mode={filterMode}
  onCurrentMonth={() => {
    applyCurrentMonth();
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
  }}

  onSpecificMonth={(year, month) => {
    applySpecificMonth(year, month);
    setSelectedYear(year);      // 🔥 IMPORTANT
    setSelectedMonth(month);    // 🔥 IMPORTANT
  }}
            onCustomRange={applyCustomRange}
          />
        }
      />

      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* Message banner */}
        {data.message && (
          <div style={{
            padding: "12px 18px",
            background: data.net_balance < 0 ? "var(--red-soft)" : "var(--green-soft)",
            border: `1px solid ${data.net_balance < 0 ? "rgba(247,95,95,0.2)" : "rgba(34,211,160,0.2)"}`,
            borderRadius: "var(--radius-md)",
            fontSize: 13, color: data.net_balance < 0 ? "var(--red)" : "var(--green)",
            fontFamily: "var(--font-mono)",
          }}>
            {data.message}
          </div>
        )}

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard
            label="Net Worth" value={fmt(data.net_worth)}
            accentColor="var(--accent)" icon="◈"
          />
          <StatCard
            label="Net Balance" value={fmt(data.net_balance)}
            accentColor={data.net_balance >= 0 ? "var(--green)" : "var(--red)"} icon="↗"
          />
          <StatCard
            label="Total Income" value={fmt(data.total_income)}
            accentColor="var(--green)" icon="💳"
          />
          <StatCard
            label="Total Expenses" value={fmt(totalExpAll)}
            sub="incl. recurring"
            accentColor="var(--red)" icon="↙"
          />
        </div>

        {/* ── SECONDARY STATS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Savings" value={fmt(data.total_savings)} accentColor="var(--green)" icon="◈" />
          <StatCard label="Invested" value={fmt(data.total_invested)} accentColor="var(--accent)" icon="◎" />
          <StatCard label="Portfolio Value" value={fmt(data.total_investment_current_value)} accentColor="var(--purple)" icon="↗" />
          <StatCard label="Remaining Principal" value={fmt(data.total_remaining_principal)} accentColor="var(--amber)" icon="⊕" />
        </div>

        {/* ── CHARTS ROW 1 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card title="Income vs Expenses" subtitle="Last 6 months">
            {/* TODO Phase 2: wire real monthly data from /api/income/income-summary/ */}
            <IncomeVsExpenseChart data={chartData} />
            {/*
<p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
  📌 Trend data coming in Phase 2 analytics endpoints
</p>
*/}
          </Card>
          <Card title="Net Worth Trend" subtitle="6-month trajectory">
            <NetWorthTrendChart data={netWorthData} />
            {/*
<p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
  📌 Trend data coming in Phase 2 analytics endpoints
</p>
*/}
          </Card>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Expense Breakdown Pie */}
          <Card title="Expense Breakdown" subtitle={data.period}>
            <ExpenseCategoryChart data={categoryChartData} />
          </Card>

          {/* Financial Allocation */}
          <Card title="Income Allocation" subtitle="How your income is distributed">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <BreakdownBar label="Direct Expenses" value={data.total_expenses} total={data.total_income} color="var(--red)" />
              <BreakdownBar label="Recurring Expenses" value={data.total_recurring_expenses} total={data.total_income} color="var(--amber)" />
              <BreakdownBar label="Liability Payments" value={data.total_liability_payments} total={data.total_income} color="var(--purple)" />
              <BreakdownBar label="Savings" value={data.total_savings} total={data.total_income} color="var(--green)" />
              <div style={{
                marginTop: 4, paddingTop: 12,
                borderTop: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                  Savings Rate
                </span>
                <Badge variant={Number(savingsRate) >= 20 ? "success" : "warning"}>
                  {savingsRate}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Investment Summary */}
          <Card title="Investment Portfolio" subtitle="Overall performance">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                background: investmentGain >= 0 ? "var(--green-soft)" : "var(--red-soft)",
                borderRadius: "var(--radius-md)", padding: "16px 20px",
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <span style={{
                  fontSize: 11, color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
                }}>Total Gain / Loss</span>
                <span style={{
                  fontSize: 26, fontWeight: 700, fontFamily: "var(--font-display)",
                  color: investmentGain >= 0 ? "var(--green)" : "var(--red)",
                  letterSpacing: "-0.02em",
                }}>
                  {investmentGain >= 0 ? "+" : ""}{fmt(investmentGain)}
                </span>
                {Number(data.total_invested) > 0 && (
                  <Badge variant={investmentGain >= 0 ? "success" : "danger"}>
                    {investmentGain >= 0 ? "↑" : "↓"} {Math.abs(pct(investmentGain, data.total_invested))}% return
                  </Badge>
                )}
              </div>

              {[
                { label: "Invested",          value: data.total_invested,                    color: "var(--text-secondary)" },
                { label: "Current Value",      value: data.total_investment_current_value,    color: "var(--text-primary)"   },
                { label: "Remaining Principal",value: data.total_remaining_principal,         color: "var(--amber)"          },
                { label: "Bills Paid",         value: data.bills?.paid_amount,                color: "var(--green)"          },
                { label: "Bills Pending",      value: data.bills?.pending_amount,             color: "var(--red)"            },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{label}</span>
                  <span style={{ fontSize: 12, color, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{fmt(value)}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </main>
    </PageLayout>
  );
};

export default Dashboard;