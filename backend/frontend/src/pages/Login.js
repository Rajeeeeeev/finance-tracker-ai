import React, { useState } from "react";
import authService from "../api/services/auth.service";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("Username and password are required.");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(form.username, form.password);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      onLogin();
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)",
    }}>
      <div style={{
        width: 380, background: "var(--surface)",
        border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        padding: "40px 36px", display: "flex", flexDirection: "column", gap: 28,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, var(--accent), var(--purple))",
            borderRadius: 12, width: 48, height: 48, margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>◈</div>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700,
            color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0,
          }}>Expense AI</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)", marginTop: 6 }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Username</label>
            <input type="text" value={form.username} onChange={set("username")} placeholder="your_username" autoFocus />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: "var(--radius-md)", padding: "12px",
              fontSize: 14, fontWeight: 600, fontFamily: "var(--font-display)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          Don't have an account?{" "}
          <a href="/signup" style={{ color: "var(--accent)" }}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em",
};

export default Login;