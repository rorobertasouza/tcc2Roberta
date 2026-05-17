import React, { useEffect, useState } from "react";
import "./MatchScreen.css";

const CONFETTI_COLORS = [
  "#f093fb", "#f5576c", "#fda085", "#43e97b",
  "#38f9d7", "#667eea", "#ffd700", "#ff6b6b",
];

function ConfettiPiece({ index }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 3;
  const size = 6 + Math.random() * 8;

  return (
    <div
      className="confetti"
      style={{
        left: `${left}%`,
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
      }}
    />
  );
}

export default function MatchScreen({ pet, whatsappUrl, onClose }) {
  const [confettiPieces] = useState(() =>
    Array.from({ length: 50 }, (_, i) => i)
  );

  // Fechar com tecla Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleWhatsApp = () => {
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="match-overlay" onClick={onClose}>
      {/* Confetes */}
      <div className="confetti-container">
        {confettiPieces.map((i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      <div className="match-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="match-title">It's a Match! 🎉</h2>
        <p className="match-subtitle">
          Você e {pet.nome} são compatíveis!
        </p>

        <img
          className="match-pet-photo"
          src={pet.foto}
          alt={pet.nome}
        />

        <h3 className="match-pet-name">{pet.nome}</h3>
        <p className="match-pet-details">
          {pet.especie} • {pet.porte} • {pet.local || "Local não informado"}
        </p>

        <div className="match-actions">
          <button className="match-btn whatsapp-btn" onClick={handleWhatsApp}>
            <span>📱</span> Falar no WhatsApp
          </button>
          <button className="match-btn continue-btn" onClick={onClose}>
            Continuar Explorando
          </button>
        </div>
      </div>
    </div>
  );
}
