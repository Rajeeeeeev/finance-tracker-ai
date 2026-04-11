import React from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const TOOLTIP_STYLE = {
  background: "#1A1E2E",
  border: "1px solid #2D3456",
  borderRadius: 10,
  padding: "10px 14px",
  fontFamily: "'DM Mono', monospace",
  fontSize: 12,
  color: "#E8ECF5",
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

const TICK_STYLE = {
  fill: "#4A5068",
  fontSize: 11,
  fontFamily: "'DM Mono', monospace",
};

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtShort = (v) =>
  `₹${
    v >= 100000
      ? (v / 100000).toFixed(1) + "L"
      : v >= 1000
      ? (v / 1000).toFixed(0) + "k"
      : v || 0
  }`;

// ─── INCOME VS EXPENSE CHART ────────────────────────────────────────────────
export const IncomeVsExpenseChart = ({ data }) => {
  if (!data?.length) return <EmptyChart />;

  // 🔥 FIX: normalize data
  const normalizedData = data.map((d) => ({
    ...d,
    expense: d.expense ?? d.expenses ?? 0,
    income: d.income ?? 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={TOOLTIP_STYLE}>
        <p style={{ margin: "0 0 6px", color: "#7A84A0" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ margin: "2px 0", color: p.color }}>
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={normalizedData} barGap={6} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#1E2235" />
        <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="income" name="Income" fill="#22D3A0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#F75F5F" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── NET WORTH TREND ─────────────────────────────────────────────────────────
export const NetWorthTrendChart = ({ data }) => {
  if (!data?.length) return <EmptyChart />;

  const normalizedData = data.map((d) => ({
    ...d,
    netWorth: d.netWorth ?? d.net_worth ?? 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={TOOLTIP_STYLE}>
        <p style={{ margin: "0 0 4px", color: "#7A84A0" }}>{label}</p>
        <p style={{ margin: 0, color: "#4F6EF7" }}>
          Net Worth: {fmt(payload[0].value)}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={normalizedData}>
        <defs>
          <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#1E2235" />
        <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
        <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="netWorth"
          stroke="#4F6EF7"
          strokeWidth={2}
          fill="url(#nwGrad)"
          dot={{ fill: "#4F6EF7", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── CATEGORY PIE ────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  Food: "#22D3A0",
  Travel: "#4F6EF7",
  Shopping: "#A78BFA",
  Bills: "#F7A84F",
  Entertainment: "#F75F5F",
  Health: "#34D399",
  Education: "#60A5FA",
  Groceries: "#FBBF24",
  Rent: "#F472B6",
  Utilities: "#818CF8",
  Other: "#7A84A0",
};

export const ExpenseCategoryChart = ({ data }) => {
  if (!data?.length) return <EmptyChart />;

  const normalizedData = data.map((d) => ({
    name: d.name || d.category,
    value: d.value ?? d.amount ?? 0,
    color: d.color,
  }));

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie data={normalizedData} dataKey="value" innerRadius={44} outerRadius={72}>
            {normalizedData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.color || CATEGORY_COLORS[entry.name] || "#7A84A0"}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        {normalizedData.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: "#7A84A0" }}>{item.name}</span>
            <span style={{ fontSize: 12, color: "#E8ECF5", fontWeight: 600 }}>
              {fmt(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
const EmptyChart = () => (
  <div
    style={{
      height: 220,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4A5068",
      fontSize: 12,
    }}
  >
    No data available for this period
  </div>
);