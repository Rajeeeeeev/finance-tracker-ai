import React from "react";
import { Button } from "../ui";

const TopBar = ({ title, subtitle, filterSlot, onAdd, addLabel = "+ Add" }) => (
  <header style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 32px",
    height: "var(--topbar-h)",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg)",
    position: "sticky", top: 0, zIndex: 100,
    flexShrink: 0,
  }}>
    <div>
      <h1 style={{
        margin: 0, fontSize: 20, fontWeight: 700,
        fontFamily: "var(--font-display)",
        color: "var(--text-primary)", letterSpacing: "-0.02em",
      }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{
          margin: "2px 0 0", fontSize: 11,
          color: "var(--text-muted)", fontFamily: "var(--font-mono)",
        }}>
          {subtitle}
        </p>
      )}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {filterSlot}
      {onAdd && (
        <Button onClick={onAdd}>
          {addLabel}
        </Button>
      )}
    </div>
  </header>
);

export default TopBar;