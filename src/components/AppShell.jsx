import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles.css";

const NAV_ITEMS = [
  { path: "/home",       icon: "🐾", label: "Explorar" },
  { path: "/favoritos",  icon: "⭐", label: "Favoritos" },
  { path: "/matches",    icon: "❤️", label: "Matches"  },
  { path: "/pos-adocao", icon: "📋", label: "Pós-Adoção" },
  { path: "/perfil",     icon: "👤", label: "Perfil"   },
];

export default function AppShell({ children, title }) {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div className="app-shell">
      {/* ── Header (visible only on mobile) ── */}
      <header className="app-header">
        <div className="app-header__logo">
          <span>🐾</span>
          {title || "Find Animal Friend"}
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="app-content">
        {children}
      </main>

      {/* ── Navigation (bottom bar on mobile, sidebar on desktop) ── */}
      <nav className="app-navbar">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`nav-item${isActive ? " active" : ""}`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
