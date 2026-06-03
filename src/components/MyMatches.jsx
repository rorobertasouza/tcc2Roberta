import React, { useState, useEffect } from "react";
import AppShell from "./AppShell.jsx";
import { API_BASE } from "../config.js";
import "./MyMatches.css";

export default function MyMatches() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adoptingId, setAdoptingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const url = userId
      ? `${API_BASE}/matches.php?user_id=${userId}`
      : `${API_BASE}/matches.php`;

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAdopt = (pet) => {
    if (adoptingId) return;
    setAdoptingId(pet.id);

    fetch(`${API_BASE}/adotar.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: pet.id, user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Atualizar localmente
          setMatches((prev) =>
            prev.map((m) =>
              m.id === pet.id ? { ...m, adotado: 1 } : m
            )
          );
          showToast(`🎉 ${pet.nome} foi adotado com sucesso!`);

          // Notificar via WebSocket se disponível
          try {
            const ws = new WebSocket(`ws://localhost:3002?user_id=${userId}`);
            ws.onopen = () => {
              ws.send(JSON.stringify({
                action: "adopt",
                pet_id: pet.id,
                user_id: userId,
              }));
              setTimeout(() => ws.close(), 1000);
            };
          } catch (e) {
            // WebSocket não disponível — fallback já foi feito via REST
          }
        } else {
          showToast(data.message || "Erro ao confirmar adoção", "error");
        }
        setAdoptingId(null);
      })
      .catch(() => {
        showToast("Erro de conexão", "error");
        setAdoptingId(null);
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
      {toast && (
        <div className={`matches-toast ${toast.type}`}>{toast.message}</div>
      )}

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
            {matches.map((pet, index) => {
              const isAdopted = pet.adotado === 1;
              const isAdopting = adoptingId === pet.id;

              return (
                <div
                  key={pet.id}
                  className={`match-card ${isAdopted ? "adopted" : ""}`}
                  style={{ animationDelay: `${index * 0.07}s` }}
                >
                  <div className="match-card-image-wrap">
                    <img
                      className="match-card-image"
                      src={pet.foto}
                      alt={pet.nome}
                    />
                    {isAdopted && (
                      <div className="match-adopted-badge">
                        🏠 Adotado!
                      </div>
                    )}
                  </div>
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

                    <div className="match-card-actions">
                      <button
                        className="btn-whatsapp"
                        onClick={() => window.open(pet.whatsapp_url, "_blank")}
                      >
                        📱 WhatsApp
                      </button>

                      {isAdopted ? (
                        <span className="btn-adopted-confirmed">
                          ✅ Adoção confirmada
                        </span>
                      ) : (
                        <button
                          className={`btn-confirm-adopt ${isAdopting ? "loading" : ""}`}
                          onClick={() => handleAdopt(pet)}
                          disabled={isAdopting}
                        >
                          {isAdopting ? "⏳ Confirmando..." : "🏠 Confirmar Adoção"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
