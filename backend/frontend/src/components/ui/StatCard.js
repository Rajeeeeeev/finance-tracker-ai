import React from "react";

const StatCard = ({ label, value, sub, trend, accentColor = "var(--accent)", icon }) => {
  const isPositive = trend >= 0;

  return (
    <div
      className="stat-card"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        overflow: "hidden",
        transition: "border-color var(--transition)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-active)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: -40, left: -40,
        width: 130, height: 130,
        background: accentColor, opacity: 0.07,
        borderRadius: "50%", filter: "blur(35px)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{
          fontSize: 11, color: "var(--text-secondary)", fontWeight: 600,
          letterSpacing: "0.07em", textTransform: "uppercase",
          fontFamily: "var(--font-mono)",
        }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: 18, opacity: 0.55 }}>{icon}</span>}
      </div>

      <div style={{
        fontSize: 30, fontWeight: 700, color: "var(--text-primary)",
        fontFamily: "var(--font-display)", letterSpacing: "-0.02em", lineHeight: 1,
      }}>
        {value}
      </div>

      {(sub || trend !== undefined) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {trend !== undefined && (
            <span style={{
              background: isPositive ? "var(--green-soft)" : "var(--red-soft)",
              color: isPositive ? "var(--green)" : "var(--red)",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
              padding: "3px 8px", borderRadius: "var(--radius-full)",
              fontFamily: "var(--font-mono)",
            }}>
              {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
          {sub && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;