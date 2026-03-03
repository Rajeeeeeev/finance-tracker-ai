import React, { useState } from "react";
import { Button } from "../ui";

const INCOME_TYPES = [
  { value: "SALARY",            label: "Salary"            },
  { value: "BUSINESS",          label: "Business Income"   },
  { value: "INVESTMENT_RETURN", label: "Investment Return" },
  { value: "RENTAL",            label: "Rental Income"     },
  { value: "OTHER",             label: "Other"             },
];

const INITIAL = { income_type: "", source_name: "", amount: "", date: "" };

const AddIncomeForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.income_type || !form.source_name || !form.amount || !form.date) {
      setError("All fields are required.");
      return;
    }
    const result = await onSubmit({
      ...form,
      amount: parseFloat(form.amount),
    });
    if (result?.success) {
      setForm(INITIAL);
    } else if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={fieldGroup}>
        <label style={labelStyle}>Income Type</label>
        <select value={form.income_type} onChange={set("income_type")}>
          <option value="">Select type...</option>
          {INCOME_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={fieldGroup}>
        <label style={labelStyle}>Source Name</label>
        <input
          type="text" value={form.source_name} onChange={set("source_name")}
          placeholder="e.g. Acme Corp, Freelance Project"
        />
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

      {error && (
        <p style={{ color: "var(--red)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          ⚠ {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add Income"}
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

export default AddIncomeForm;