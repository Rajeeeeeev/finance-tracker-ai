import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import { Card, Badge, Loader, ErrorDisplay } from "../components/ui";
import { useAnalytics } from "../hooks/useAnalytics";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── FORMATTER ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

// ─── CATEGORY COLORS ──────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Food:          "#4F6EF7",
  Travel:        "#22D3A0",
  Shopping:      "#F75F5F",
  Bills:         "#A78BFA",
  Entertainment: "#F7A84F",
  Health:        "#F75F5F",
  Education:     "#22D3A0",
  Groceries:     "#4F6EF7",
  Rent:          "#A78BFA",
  Utilities:     "#F7A84F",
  Savings:       "#22D3A0",
  Other:         "#4A5068",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border-active)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "var(--font-mono)",
    }}>
      <p style={{ margin: "0 0 8px", fontWeight: 600, color: "var(--text-primary)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "3px 0", color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── PIE TOOLTIP ─────────────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: inner } = payload[0];
  return (
    <div style={{
      background: "var(--surface-2)",
      border: "1px solid var(--border-active)",
      borderRadius: "var(--radius-md)",
      padding: "10px 14px",
      fontSize: 12,
      fontFamily: "var(--font-mono)",
    }}>
      <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{name}</p>
      <p style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>
        {fmt(value)} — {inner.percentage}%
      </p>
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{
        fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        {label}
      </span>
      <span style={{ fontSize: 16, opacity: 0.5 }}>{icon}</span>
    </div>
    <span style={{
      fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)",
      color: color || "var(--text-primary)", letterSpacing: "-0.02em",
    }}>
      {value}
    </span>
  </div>
);

// ─── MONTH/YEAR PICKER ────────────────────────────────────────────────────────
const MonthYearPicker = ({ selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const today = new Date();
  const years = [today.getFullYear(), today.getFullYear() - 1, today.getFullYear() - 2];
  const selectStyle = {
    width: "auto",
    padding: "6px 10px",
    fontSize: 12,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
  };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select value={selectedYear} onChange={e => onYearChange(Number(e.target.value))} style={selectStyle}>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={selectedMonth} onChange={e => onMonthChange(Number(e.target.value))} style={selectStyle}>
        {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </select>
    </div>
  );
};

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const {
    monthlyTrend,
    categoryData,
    yoyData,
    loading,
    errors,
    selectedYear,
    selectedMonth,
    setSelectedYear,
    setSelectedMonth,
  } = useAnalytics();

  const now = new Date();
  const periodLabel = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const totalExpenses = monthlyTrend.reduce((s, m) => s + m.expenses, 0);
  const totalIncome   = monthlyTrend.reduce((s, m) => s + m.income, 0);
  const totalSavings  = totalIncome - totalExpenses;
  const avgMonthly    = monthlyTrend.length ? totalExpenses / monthlyTrend.length : 0;

  const axisTick = {
    fontSize: 11,
    fill: "#4A5068",
    fontFamily: "DM Mono, monospace",
  };

  return (
    <PageLayout activePath="/analytics">
      <TopBar title="Analytics" subtitle={periodLabel} />

      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>

        {/* ── SUMMARY STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <StatCard label="Total spent (12m)"  value={fmt(totalExpenses)} color="var(--red)"    icon="↙" />
          <StatCard label="Total income (12m)" value={fmt(totalIncome)}   color="var(--green)"  icon="↗" />
          <StatCard label="Net savings (12m)"  value={fmt(totalSavings)}  color={totalSavings >= 0 ? "var(--green)" : "var(--red)"} icon="◈" />
          <StatCard label="Avg monthly spend"  value={fmt(avgMonthly)}    color="var(--accent)" icon="◎" />
        </div>

        {/* ── MONTHLY TREND LINE CHART ── */}
        <Card
          title="Monthly trend"
          subtitle="Income vs expenses vs savings — last 12 months"
        >
          {loading.trend ? (
            <Loader message="Loading trend data..." />
          ) : errors.trend ? (
            <ErrorDisplay message={errors.trend} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrend} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2235" />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                  tick={axisTick} tickLine={false} axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#7A84A0" }}
                />
                <Line type="monotone" dataKey="income"   stroke="#22D3A0" strokeWidth={2.5} dot={false} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#F75F5F" strokeWidth={2.5} dot={false} name="Expenses" />
                <Line type="monotone" dataKey="savings"  stroke="#4F6EF7" strokeWidth={2}   dot={false} strokeDasharray="5 4" name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ── BOTTOM ROW ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* Category Breakdown Donut */}
          <Card
            title="Category breakdown"
            subtitle="Expenses by category"
            action={
              <MonthYearPicker
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
              />
            }
          >
            {loading.category ? (
              <Loader message="Loading breakdown..." />
            ) : errors.category ? (
              <ErrorDisplay message={errors.category} />
            ) : !categoryData.breakdown?.length ? (
              <div style={{
                textAlign: "center", padding: "40px 0",
                color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12,
              }}>
                No expense data for this period.
              </div>
            ) : (
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData.breakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={90}
                      paddingAngle={2}
                    >
                      {categoryData.breakdown.map((entry, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[entry.category] || "#4A5068"} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Total spent</p>
                    <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
                      {fmt(categoryData.total)}
                    </p>
                  </div>
                  {categoryData.breakdown.map((b, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: CATEGORY_COLORS[b.category] || "#4A5068",
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)", flex: 1 }}>
                        {b.category}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {fmt(b.amount)}
                      </span>
                      <Badge variant="default">{b.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Year-over-Year Bar Chart */}
          <Card
            title="Year-over-year comparison"
            subtitle={`${yoyData.prev_year} vs ${yoyData.current_year} — monthly expenses`}
          >
            {loading.yoy ? (
              <Loader message="Loading comparison..." />
            ) : errors.yoy ? (
              <ErrorDisplay message={errors.yoy} />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={yoyData.data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2235" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                    tick={axisTick} tickLine={false} axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="square" iconSize={10}
                    wrapperStyle={{ fontSize: 12, fontFamily: "DM Mono, monospace", color: "#7A84A0" }}
                  />
                  <Bar dataKey={String(yoyData.prev_year)}    fill="#1E2235" radius={[4,4,0,0]} name={String(yoyData.prev_year)} />
                  <Bar dataKey={String(yoyData.current_year)} fill="#4F6EF7" radius={[4,4,0,0]} name={String(yoyData.current_year)} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

        </div>
      </main>
    </PageLayout>
  );
};

export default AnalyticsPage;