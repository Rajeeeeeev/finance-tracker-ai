import React, { useState } from "react";
import { Button } from "../ui";

const CATEGORIES = [
  "Food","Travel","Shopping","Bills","Entertainment",
  "Health","Education","Groceries","Rent","Utilities","Other"
];

const PAYMENT_METHODS = [
  "Cash","UPI","Bank Transfer","Credit Card","Debit Card","Wallet"
];

const INITIAL = {
  category: "", amount: "", date: "",
  payment_method: "UPI", description: "",
};

const AddExpenseForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.category || !form.amount || !form.date) {
      setError("Category, amount and date are required.");
      return;
    }

    const payload = {
      amount: parseFloat(form.amount),
      category: form.category,
      payment_method: form.payment_method,
      date: form.date,
      source: "MANUAL",
    };

    if (form.description && form.description.trim() !== "") {
      payload.description = form.description.trim();
    }

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
          <label style={labelStyle}>Category</label>
          <select value={form.category} onChange={set("category")}>
            <option value="">Select category...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Payment Method</label>
          <select value={form.payment_method} onChange={set("payment_method")}>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Amount (₹)</label>
          <input
            type="number" value={form.amount} onChange={set("amount")}
            placeholder="0.00" min="0" step="0.01"
          />
        </div>
        <div style={fieldGroup}>
          <label style={labelStyle}>Date</label>
          <input type="date" value={form.date} onChange={set("date")} />
        </div>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Description (optional)</label>
        <input
          type="text" value={form.description} onChange={set("description")}
          placeholder="e.g. Dinner with team, Monthly electricity bill"
        />
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        {onCancel && <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Expense"}
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

export default AddExpenseForm;