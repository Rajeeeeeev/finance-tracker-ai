import React from "react";

const NAV_ITEMS = [
  { icon: "▦", label: "Dashboard",     path: "/"             },
  { icon: "↗", label: "Income",        path: "/income"       },
  { icon: "↙", label: "Expenses",      path: "/expenses"     },
  { icon: "◎", label: "Investments",   path: "/investments"  },
  { icon: "★", label: "Credit Cards",  path: "/credit-cards" },
  { icon: "⟳", label: "Recurring",     path: "/recurring"    },
  { icon: "◉", label: "Bill Reminders",path: "/bills"        },
  { icon: "◈", label: "Savings",       path: "/savings"      },
  { icon: "⊕", label: "Liabilities",   path: "/liabilities"  },
];

const Sidebar = ({ activePath = "/" }) => {
  return (
    <aside style={{
      width: "var(--sidebar-w)",
      flexShrink: 0,
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      padding: "28px 14px 20px",
      height: "100vh",
      position: "sticky",
      top: 0,
      overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 8px 28px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          background: "linear-gradient(135deg, var(--accent), var(--purple))",
          borderRadius: 9, width: 30, height: 30,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, flexShrink: 0,
        }}>
          ◈
        </div>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)", letterSpacing: "-0.01em",
          }}>
            Expense AI
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Finance Tracker
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path;
          return (<a
            
              key={item.label} 
              href={item.path}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: "var(--radius-md)",
                background: isActive ? "var(--accent-soft)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                fontFamily: "var(--font-display)",
                textDecoration: "none",
                transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--surface-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: "center", flexShrink: 0 }}>
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom — AI Engine status chip */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <div style={{
          padding: "10px 12px",
          background: "var(--purple-soft)",
          borderRadius: "var(--radius-md)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 10, color: "var(--purple)" }}>●</span>
          <div>
            <div style={{
              fontSize: 11, fontWeight: 600, color: "var(--purple)",
              fontFamily: "var(--font-display)",
            }}>
              AI Engine
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Phase 3 · Coming soon
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;