import React, { useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";
import { Card, Badge, Loader, ErrorDisplay, EmptyState, Button } from "../components/ui";
import StatCard from "../components/ui/StatCard";
import AddInvestmentForm from "../components/forms/AddInvestmentForm";
import useInvestment from "../hooks/useInvestment";

// ─── FORMATTER ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const TYPE_LABELS = {
  EQUITY: "Equity", COMMODITY: "Commodity",
  BOND: "Bond", DEPOSIT: "Deposit", OTHER: "Other",
};

// ─── CHANGE LOG ENTRY ─────────────────────────────────────────────────────────
const LogEntry = ({ log }) => {
  const isUp    = log.direction === "up";
  const color   = isUp ? "var(--green)" : "var(--red)";
  const bgColor = isUp ? "var(--green-soft)" : "var(--red-soft)";
  const arrow   = isUp ? "↑" : "↓";
  const label   = log.field_changed === "invested" ? "Invested amt" : "Current val";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px",
      borderBottom: "1px solid var(--border)",
      fontSize: 12,
    }}>
      {/* Direction badge */}
      <span style={{
        background: bgColor, color,
        borderRadius: "var(--radius-full)",
        padding: "3px 8px",
        fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 11,
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {arrow} {fmt(Math.abs(Number(log.delta)))}
      </span>

      {/* Field label */}
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
        {label}
      </span>

      {/* Old → New */}
      <span style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", flex: 1 }}>
        {fmt(log.old_value)}
        <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>→</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{fmt(log.new_value)}</span>
      </span>

      {/* Note if present */}
      {log.note && (
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontStyle: "italic" }}>
          "{log.note}"
        </span>
      )}

      {/* Timestamp */}
      <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
        {timeAgo(log.changed_at)}
      </span>
    </div>
  );
};

// ─── INLINE UPDATE PANEL ──────────────────────────────────────────────────────
const UpdatePanel = ({ investment, onUpdate, onClose, submitting, fetchLogs }) => {
  const [investedAmt, setInvestedAmt] = useState(String(investment.invested_amount));
  const [currentAmt,  setCurrentAmt]  = useState(String(investment.current_amount));
  const [note,        setNote]        = useState("");
  const [logs,        setLogs]        = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [toast,       setToast]       = useState(null);

  // Live P&L preview
  const previewPL  = Number(currentAmt || 0) - Number(investedAmt || 0);
  const previewPct = Number(investedAmt) > 0
    ? ((previewPL / Number(investedAmt)) * 100).toFixed(2)
    : "0.00";

  // Load logs on mount
  React.useEffect(() => {
    fetchLogs(investment.id).then((res) => {
      if (res.success) setLogs(res.data);
      setLogsLoading(false);
    });
  }, [investment.id, fetchLogs]);

  const handleUpdate = async () => {
    const payload = {};
    if (investedAmt !== String(investment.invested_amount))
      payload.invested_amount = investedAmt;
    if (currentAmt !== String(investment.current_amount))
      payload.current_amount = currentAmt;
    if (note.trim()) payload.note = note.trim();

    if (!Object.keys(payload).length) {
      setToast({ type: "warn", msg: "No changes made." });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const result = await onUpdate(investment.id, payload);
    if (result.success) {
      setToast({ type: "ok", msg: "Updated successfully." });
      setTimeout(() => { setToast(null); onClose(); }, 1200);
    } else {
      setToast({ type: "err", msg: result.error || "Update failed." });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const inputStyle = {
    padding: "9px 12px", fontSize: 13,
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-mono)",
    width: "100%",
  };

  const labelStyle = {
    fontSize: 11, color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 6, display: "block",
  };

  return (
    <div style={{
      background: "var(--surface-2)",
      borderTop: "1px solid var(--border)",
      padding: "20px 24px",
      display: "flex", flexDirection: "column", gap: 20,
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          padding: "10px 16px", borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-mono)", fontSize: 12,
          background: toast.type === "ok"
            ? "var(--green-soft)" : toast.type === "warn"
            ? "var(--amber-soft)" : "var(--red-soft)",
          color: toast.type === "ok"
            ? "var(--green)" : toast.type === "warn"
            ? "var(--amber)" : "var(--red)",
          border: `1px solid ${toast.type === "ok"
            ? "rgba(34,211,160,0.2)" : toast.type === "warn"
            ? "rgba(247,168,79,0.2)" : "rgba(247,95,95,0.2)"}`,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── INPUT FIELDS ── */}
        <div style={{ display: "flex", gap: 16, flex: 1, minWidth: 300, flexWrap: "wrap" }}>

          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={labelStyle}>Invested amount</label>
            <input
              type="number" value={investedAmt}
              onChange={e => setInvestedAmt(e.target.value)}
              style={inputStyle} min="0" step="0.01"
            />
          </div>

          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={labelStyle}>Current value</label>
            <input
              type="number" value={currentAmt}
              onChange={e => setCurrentAmt(e.target.value)}
              style={inputStyle} min="0" step="0.01"
            />
          </div>

          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={labelStyle}>Note (optional)</label>
            <input
              type="text" value={note} placeholder="e.g. bought 10 more units"
              onChange={e => setNote(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* ── LIVE P&L PREVIEW ── */}
        <div style={{
          background: previewPL >= 0 ? "var(--green-soft)" : "var(--red-soft)",
          border: `1px solid ${previewPL >= 0 ? "rgba(34,211,160,0.2)" : "rgba(247,95,95,0.2)"}`,
          borderRadius: "var(--radius-md)",
          padding: "14px 20px", minWidth: 160,
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            P&L preview
          </span>
          <span style={{
            fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)",
            color: previewPL >= 0 ? "var(--green)" : "var(--red)",
            letterSpacing: "-0.02em",
          }}>
            {previewPL >= 0 ? "+" : ""}{fmt(previewPL)}
          </span>
          <span style={{ fontSize: 12, color: previewPL >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-mono)" }}>
            {previewPL >= 0 ? "↑" : "↓"} {Math.abs(previewPct)}%
          </span>
        </div>

        {/* ── ACTION BUTTONS ── */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", paddingBottom: 2 }}>
          <Button onClick={handleUpdate} disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>

      </div>

      {/* ── CHANGE LOG ── */}
      <div>
        <p style={{
          fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)",
          textTransform: "uppercase", letterSpacing: "0.06em",
          marginBottom: 10,
        }}>
          Change history
        </p>

        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}>
          {logsLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              Loading history...
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
              No changes recorded yet. Updates will appear here.
            </div>
          ) : (
            logs.map((log) => <LogEntry key={log.id} log={log} />)
          )}
        </div>
      </div>

    </div>
  );
};

// ─── INVESTMENTS PAGE ─────────────────────────────────────────────────────────
const InvestmentsPage = () => {
  const {
    investments, loading, error, submitting,
    addInvestment, updateInvestment, deleteInvestment, fetchLogs,
  } = useInvestment();

  const [showForm,      setShowForm]      = useState(false);
  const [expandedId,    setExpandedId]    = useState(null);

  const totalInvested = investments.reduce((s, i) => s + Number(i.invested_amount), 0);
  const totalCurrent  = investments.reduce((s, i) => s + Number(i.current_amount), 0);
  const totalGain     = totalCurrent - totalInvested;

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <PageLayout activePath="/investments">
      <TopBar
        title="Investments"
        subtitle={`${investments.length} holdings`}
        onAdd={() => setShowForm(true)}
        addLabel="+ Add Investment"
      />

      <main style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── SUMMARY CARDS ── */}
        {!loading && investments.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <StatCard label="Total Invested"  value={fmt(totalInvested)} accentColor="var(--accent)"  icon="◎" />
            <StatCard label="Current Value"   value={fmt(totalCurrent)}  accentColor="var(--purple)"  icon="↗" />
            <StatCard
              label="Total P&L" value={fmt(totalGain)}
              accentColor={totalGain >= 0 ? "var(--green)" : "var(--red)"}
              icon={totalGain >= 0 ? "↑" : "↓"}
            />
          </div>
        )}

        {/* ── ADD FORM ── */}
        {showForm && (
          <Card title="Add New Investment">
            <AddInvestmentForm
              onSubmit={async (payload) => {
                const result = await addInvestment(payload);
                if (result.success) setShowForm(false);
                return result;
              }}
              onCancel={() => setShowForm(false)}
              submitting={submitting}
            />
          </Card>
        )}

        {loading && <Loader message="Loading investments..." />}
        {error   && <ErrorDisplay message={error} />}

        {!loading && !error && (
          <Card title="Portfolio Holdings">
            {investments.length === 0 ? (
              <EmptyState
                icon="◎" title="No investments tracked yet"
                description="Add your first investment to start tracking your portfolio"
                action={<Button onClick={() => setShowForm(true)}>+ Add Investment</Button>}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>

                {/* Table header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                  padding: "8px 16px", gap: 12,
                  borderBottom: "1px solid var(--border)",
                }}>
                  {["Name", "Type", "Invested", "Current", "P&L", ""].map((h, i) => (
                    <span key={i} style={{
                      fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* Rows */}
                {investments.map((inv) => {
                  const gain      = Number(inv.profit_loss) || 0;
                  const gainPct   = Number(inv.profit_loss_percentage) || 0;
                  const isExpanded = expandedId === inv.id;

                  return (
                    <div key={inv.id} style={{ borderBottom: "1px solid var(--border)" }}>

                      {/* ── MAIN ROW ── */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                          padding: "14px 16px", gap: 12, alignItems: "center",
                          background: isExpanded ? "var(--surface-2)" : "transparent",
                          transition: "background var(--transition)",
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = "var(--surface-hover)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isExpanded) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Name + symbol */}
                        <div>
                          <div style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 600 }}>
                            {inv.name}
                          </div>
                          {inv.symbol && (
                            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                              {inv.symbol}
                            </div>
                          )}
                        </div>

                        {/* Type badge */}
                        <Badge variant="default">
                          {TYPE_LABELS[inv.investment_type] || inv.investment_type}
                        </Badge>

                        {/* Invested */}
                        <span style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                          {fmt(inv.invested_amount)}
                        </span>

                        {/* Current */}
                        <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {fmt(inv.current_amount)}
                        </span>

                        {/* P&L */}
                        <div>
                          <span style={{
                            fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)",
                            color: gain >= 0 ? "var(--green)" : "var(--red)",
                          }}>
                            {gain >= 0 ? "+" : ""}{fmt(gain)}
                          </span>
                          <div style={{ fontSize: 11, color: gain >= 0 ? "var(--green)" : "var(--red)", fontFamily: "var(--font-mono)" }}>
                            {gain >= 0 ? "↑" : "↓"} {Math.abs(gainPct).toFixed(2)}%
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <button
                            onClick={() => toggleExpand(inv.id)}
                            style={{
                              background: isExpanded ? "var(--accent-soft)" : "var(--surface-2)",
                              color: isExpanded ? "var(--accent)" : "var(--text-secondary)",
                              border: `1px solid ${isExpanded ? "rgba(79,110,247,0.3)" : "var(--border)"}`,
                              borderRadius: "var(--radius-sm)",
                              padding: "4px 10px", fontSize: 11, fontWeight: 600,
                              fontFamily: "var(--font-mono)", cursor: "pointer",
                              transition: "all var(--transition)",
                            }}
                          >
                            {isExpanded ? "Close" : "Update"}
                          </button>
                          <button
                            onClick={() => deleteInvestment(inv.id)}
                            style={{
                              background: "var(--red-soft)", color: "var(--red)",
                              border: "none", borderRadius: "var(--radius-sm)",
                              padding: "4px 10px", fontSize: 11, fontWeight: 600,
                              fontFamily: "var(--font-mono)", cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>

                      </div>

                      {/* ── INLINE UPDATE + LOG PANEL ── */}
                      {isExpanded && (
                        <UpdatePanel
                          investment={inv}
                          onUpdate={updateInvestment}
                          onClose={() => setExpandedId(null)}
                          submitting={submitting}
                          fetchLogs={fetchLogs}
                        />
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </main>
    </PageLayout>
  );
};

export default InvestmentsPage;