import React, { useState, useEffect } from "react";
import AppShell from "./AppShell.jsx";
import { API_BASE } from "../config.js";
import "./Favoritos.css";

export default function Favoritos() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id;

  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFavoritos();
  }, []);

  const fetchFavoritos = () => {
    const url = `${API_BASE}/favoritos.php?user_id=${userId}`;
    fetch(url, { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFavoritos(data.favoritos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRemoveFavorite = (petId) => {
    fetch(`${API_BASE}/favoritos.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: petId, user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.action === "removed") {
          setFavoritos((prev) => prev.filter((f) => f.id !== petId));
          showToast("Removido dos favoritos ✨");
        }
      })
      .catch(() => showToast("Erro ao remover", "error"));
  };

  const handleLike = (petId) => {
    fetch(`${API_BASE}/match.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: petId, action: "like", user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Match registrado! ❤️");
        }
      })
      .catch(() => showToast("Erro ao registrar match", "error"));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <AppShell title="Favoritos">
        <div className="spinner-global">
          <div className="ring" />
          <p>Carregando favoritos...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Favoritos">
      {toast && (
        <div className={`fav-toast ${toast.type}`}>{toast.message}</div>
      )}

      <div className="favoritos-page">
        <div className="favoritos-hero">
          <p className="favoritos-count">
            {favoritos.length > 0
              ? `${favoritos.length} pet${favoritos.length > 1 ? "s" : ""} salvos ⭐`
              : "Seus favoritos aparecerão aqui"}
          </p>
        </div>

        {favoritos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">⭐</span>
            <h3>Nenhum favorito ainda</h3>
            <p>Toque na estrela ☆ nos cards para salvar pets que você quer decidir depois!</p>
          </div>
        ) : (
          <div className="favoritos-grid">
            {favoritos.map((pet, idx) => (
              <div
                key={pet.id}
                className={`fav-card ${pet.adotado ? "fav-adopted" : ""}`}
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                <div className="fav-card-image-wrap">
                  <img
                    className="fav-card-image"
                    src={pet.foto}
                    alt={pet.nome}
                  />
                  {pet.adotado === 1 && (
                    <span className="fav-adopted-badge">🏠 Adotado</span>
                  )}
                  <button
                    className="fav-remove-btn"
                    onClick={() => handleRemoveFavorite(pet.id)}
                    title="Remover dos favoritos"
                  >
                    ✕
                  </button>
                </div>

                <div className="fav-card-body">
                  <h3 className="fav-card-name">{pet.nome}</h3>
                  <p className="fav-card-breed">
                    🐾 {pet.especie}
                    {pet.idade ? ` · ${pet.idade} anos` : ""}
                  </p>

                  <div className="fav-card-tags">
                    {pet.porte && <span className="chip">📏 {pet.porte}</span>}
                    {pet.sexo && (
                      <span className="chip">
                        {pet.sexo === "Macho" || pet.sexo === "M" ? "♂️" : "♀️"} {pet.sexo}
                      </span>
                    )}
                    {pet.local && <span className="chip">📍 {pet.local}</span>}
                  </div>

                  {pet.favoritado_em && (
                    <p className="fav-date">⭐ Salvo em {formatDate(pet.favoritado_em)}</p>
                  )}

                  {!pet.adotado && (
                    <button
                      className="fav-like-btn"
                      onClick={() => handleLike(pet.id)}
                    >
                      ❤️ Dar Match
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
