import React from "react";

// ─── CARD ────────────────────────────────────────────────────────────────────
export const Card = ({ title, subtitle, children, action, style = {} }) => (
  <div style={{
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    ...style,
  }}>
    {(title || action) && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {title && (
            <h3 style={{
              margin: 0, fontSize: 15, fontWeight: 600,
              color: "var(--text-primary)", fontFamily: "var(--font-display)",
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              margin: "4px 0 0", fontSize: 11,
              color: "var(--text-secondary)", fontFamily: "var(--font-mono)",
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

// ─── BADGE ───────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: { bg: "var(--accent-soft)",  color: "var(--accent)"  },
    success: { bg: "var(--green-soft)",   color: "var(--green)"   },
    danger:  { bg: "var(--red-soft)",     color: "var(--red)"     },
    warning: { bg: "var(--amber-soft)",   color: "var(--amber)"   },
    purple:  { bg: "var(--purple-soft)",  color: "var(--purple)"  },
  };
  const s = styles[variant] || styles.default;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
      padding: "3px 8px", borderRadius: "var(--radius-full)",
      fontFamily: "var(--font-mono)", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
};

// ─── BUTTON ──────────────────────────────────────────────────────────────────
export const Button = ({
  children, onClick, variant = "primary",
  size = "md", disabled = false, fullWidth = false, type = "button"
}) => {
  const variants = {
    primary: {
      background: "var(--accent)", color: "#fff", border: "none",
    },
    secondary: {
      background: "var(--surface-2)", color: "var(--text-primary)",
      border: "1px solid var(--border)",
    },
    danger: {
      background: "var(--red-soft)", color: "var(--red)",
      border: "1px solid rgba(247,95,95,0.2)",
    },
    ghost: {
      background: "transparent", color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
  };
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "9px 20px", fontSize: 13 },
    lg: { padding: "12px 28px", fontSize: 14 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: "var(--radius-md)",
        fontWeight: 600,
        fontFamily: "var(--font-display)",
        letterSpacing: "0.01em",
        transition: "opacity var(--transition), transform var(--transition)",
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
};

// ─── LOADER ──────────────────────────────────────────────────────────────────
export const Loader = ({ message = "Loading..." }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    height: "100%", minHeight: 200, gap: 12,
  }}>
    <div style={{
      width: 32, height: 32,
      border: "3px solid var(--border)",
      borderTop: "3px solid var(--accent)",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
      {message}
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── EMPTY STATE ─────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = "◈", title, description, action }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 24px", gap: 12, textAlign: "center",
  }}>
    <span style={{ fontSize: 36, opacity: 0.3 }}>{icon}</span>
    <h3 style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontSize: 15 }}>
      {title}
    </h3>
    {description && (
      <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {description}
      </p>
    )}
    {action}
  </div>
);

// ─── ERROR DISPLAY ───────────────────────────────────────────────────────────
export const ErrorDisplay = ({ message, onRetry }) => (
  <div style={{
    background: "var(--red-soft)", border: "1px solid rgba(247,95,95,0.2)",
    borderRadius: "var(--radius-lg)", padding: "20px 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
  }}>
    <span style={{ color: "var(--red)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
      ⚠ {message}
    </span>
    {onRetry && <Button variant="danger" size="sm" onClick={onRetry}>Retry</Button>}
  </div>
);