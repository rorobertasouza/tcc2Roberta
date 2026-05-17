import React, { useState, useEffect } from "react";
import AppShell from "./AppShell.jsx";
import "./MyMatches.css";

export default function MyMatches() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = userId
      ? `http://localhost/find-animal-friend-react/api/matches.php?user_id=${userId}`
      : "http://localhost/find-animal-friend-react/api/matches.php";

    fetch(url, { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMatches(data.matches);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (loading) {
    return (
      <AppShell title="Meus Matches">
        <div className="spinner-global">
          <div className="ring" />
          <p>Carregando matches...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Meus Matches">
      <div className="matches-page">
        {/* Contador */}
        <div className="matches-hero">
          <p className="matches-count">
            {matches.length > 0
              ? `${matches.length} match${matches.length > 1 ? "es" : ""} 🎉`
              : "Seus favorites aparecerão aqui"}
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🐾</span>
            <h3>Nenhum match ainda</h3>
            <p>Explore os pets e curta os que mais gostar!</p>
          </div>
        ) : (
          <div className="matches-grid">
            {matches.map((pet, index) => (
              <div
                key={pet.id}
                className="match-card"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <img
                  className="match-card-image"
                  src={pet.foto}
                  alt={pet.nome}
                />
                <div className="match-card-body">
                  <h3 className="match-card-name">{pet.nome}</h3>
                  <p className="match-card-breed">
                    🐾 {pet.especie}
                    {pet.idade ? ` · ${pet.idade} anos` : ""}
                  </p>
                  <div className="match-card-tags">
                    {pet.porte   && <span className="chip">📏 {pet.porte}</span>}
                    {pet.sexo    && (
                      <span className="chip">
                        {pet.sexo === "Macho" || pet.sexo === "M" ? "♂️" : "♀️"} {pet.sexo}
                      </span>
                    )}
                    {pet.local   && <span className="chip">📍 {pet.local}</span>}
                    {pet.vacinado && <span className="chip">💉 {pet.vacinado}</span>}
                    {pet.castrado && <span className="chip">✂️ {pet.castrado}</span>}
                  </div>
                  {pet.matched_at && (
                    <p className="match-date">🕐 Match em {formatDate(pet.matched_at)}</p>
                  )}
                  <button
                    className="btn-whatsapp"
                    onClick={() => window.open(pet.whatsapp_url, "_blank")}
                  >
                    📱 Falar no WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
