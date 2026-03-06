import React, { useState } from "react";
import { Button } from "../ui";

const NETWORKS = ["Visa", "Mastercard", "RuPay", "Amex", "Other"];

const INITIAL = {
  card_name:        "",
  bank_name:        "",
  card_network:     "Visa",
  last_four_digits: "",
  credit_limit:     "",
  billing_date:     "",
  due_date_days:    "15",
  interest_rate:    "36",
};

const AddCreditCardForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.card_name || !form.bank_name || !form.last_four_digits ||
        !form.credit_limit || !form.billing_date) {
      setError("All fields except interest rate are required.");
      return;
    }

    if (form.last_four_digits.length !== 4 || isNaN(form.last_four_digits)) {
      setError("Last four digits must be exactly 4 numbers.");
      return;
    }

    if (Number(form.billing_date) < 1 || Number(form.billing_date) > 28) {
      setError("Billing date must be between 1 and 28.");
      return;
    }

    const payload = {
      card_name:        form.card_name.trim(),
      bank_name:        form.bank_name.trim(),
      card_network:     form.card_network,
      last_four_digits: form.last_four_digits,
      credit_limit:     parseFloat(form.credit_limit),
      billing_date:     parseInt(form.billing_date),
      due_date_days:    parseInt(form.due_date_days),
      interest_rate:    parseFloat(form.interest_rate),
    };

    const result = await onSubmit(payload);
    if (result?.success) {
      setForm(INITIAL);
    } else if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Card Name</label>
          <input
            type="text" value={form.card_name} onChange={set("card_name")}
            placeholder="e.g. HDFC Millennia"
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Bank Name</label>
          <input
            type="text" value={form.bank_name} onChange={set("bank_name")}
            placeholder="e.g. HDFC Bank"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Card Network</label>
          <select value={form.card_network} onChange={set("card_network")}>
            {NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Last 4 Digits</label>
          <input
            type="text" value={form.last_four_digits} onChange={set("last_four_digits")}
            placeholder="4242" maxLength={4}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Credit Limit (₹)</label>
          <input
            type="number" value={form.credit_limit} onChange={set("credit_limit")}
            placeholder="100000" min="0"
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Billing Date (day of month)</label>
          <input
            type="number" value={form.billing_date} onChange={set("billing_date")}
            placeholder="1–28" min="1" max="28"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Due (days after billing)</label>
          <input
            type="number" value={form.due_date_days} onChange={set("due_date_days")}
            placeholder="15" min="1" max="45"
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Interest Rate (% per year)</label>
          <input
            type="number" value={form.interest_rate} onChange={set("interest_rate")}
            placeholder="36" min="0" max="60" step="0.1"
          />
        </div>
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        {onCancel && <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Card"}
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

export default AddCreditCardForm;