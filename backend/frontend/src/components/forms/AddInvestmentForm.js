import React, { useState } from "react";
import { Button } from "../ui";

const INVESTMENT_TYPES = [
  { value: "EQUITY",    label: "Equity (Stocks/Mutual Funds)" },
  { value: "COMMODITY", label: "Commodity (Gold, Silver)"     },
  { value: "BOND",      label: "Bond / Debenture"             },
  { value: "DEPOSIT",   label: "Fixed / Recurring Deposit"    },
  { value: "OTHER",     label: "Other"                        },
];

const INITIAL = {
  investment_type: "", name: "", symbol: "",
  invested_amount: "", current_amount: "", notes: "",
};

const AddInvestmentForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.investment_type || !form.name || !form.invested_amount || !form.current_amount) {
      setError("Type, name, invested amount and current amount are required.");
      return;
    }
    const result = await onSubmit({
      ...form,
      invested_amount: parseFloat(form.invested_amount),
      current_amount: parseFloat(form.current_amount),
      symbol: form.symbol || undefined,
    });
    if (result?.success) {
      setForm(INITIAL);
    } else if (result?.error) {
      setError(result.error);
    }
  };

  const gain = form.invested_amount && form.current_amount
    ? parseFloat(form.current_amount) - parseFloat(form.invested_amount)
    : null;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={fieldGroup}>
        <label style={labelStyle}>Investment Type</label>
        <select value={form.investment_type} onChange={set("investment_type")}>
          <option value="">Select type...</option>
          {INVESTMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Investment Name</label>
          <input type="text" value={form.name} onChange={set("name")} placeholder="e.g. Nifty 50 Index Fund" />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Symbol (optional)</label>
          <input type="text" value={form.symbol} onChange={set("symbol")} placeholder="e.g. NIFTYBEES" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Invested Amount (₹)</label>
          <input type="number" value={form.invested_amount} onChange={set("invested_amount")} placeholder="0.00" min="0" step="0.01" />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Current Value (₹)</label>
          <input type="number" value={form.current_amount} onChange={set("current_amount")} placeholder="0.00" min="0" step="0.01" />
        </div>
      </div>

      {/* Live P&L preview */}
      {gain !== null && (
        <div style={{
          padding: "10px 14px",
          background: gain >= 0 ? "var(--green-soft)" : "var(--red-soft)",
          borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600,
            color: gain >= 0 ? "var(--green)" : "var(--red)",
          }}>
            {gain >= 0 ? "↑" : "↓"} Estimated P&L: ₹{Math.abs(gain).toFixed(2)}
            {" "}({((gain / parseFloat(form.invested_amount)) * 100).toFixed(2)}%)
          </span>
        </div>
      )}

      <div style={fieldGroup}>
        <label style={labelStyle}>Notes (optional)</label>
        <input type="text" value={form.notes} onChange={set("notes")} placeholder="e.g. Long term hold, SIP investment" />
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          ⚠ {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        {onCancel && <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Investment"}
        </Button>
      </div>
    </form>
  );
};

const fieldGroup = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
};

export default AddInvestmentForm;