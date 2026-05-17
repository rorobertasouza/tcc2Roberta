import React, { useState, useRef } from "react";
import "./SwipeCard.css";

export default function SwipeCard({ pet, onLike, onDislike }) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  const startX = useRef(0);
  const cardRef = useRef(null);

  const SWIPE_THRESHOLD = 100;

  // Calcular classe do badge de compatibilidade
  const getCompatibilityClass = () => {
    if (!pet.compatibilidade) return "";
    if (pet.compatibilidade >= 80) return "high";
    if (pet.compatibilidade >= 50) return "medium";
    return "";
  };

  // Drag handlers
  const handlePointerDown = (e) => {
    // Não inicia drag se o clique veio de um botão
    if (e.target.closest('button')) return;
    startX.current = e.clientX;
    setIsDragging(true);
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    setDragX(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      // Swipe para direita = like
      setExitDirection("right");
      setTimeout(() => {
        onLike();
        resetCard();
      }, 450);
    } else if (dragX < -SWIPE_THRESHOLD) {
      // Swipe para esquerda = dislike
      setExitDirection("left");
      setTimeout(() => {
        onDislike();
        resetCard();
      }, 450);
    } else {
      // Não atingiu o threshold, volta ao centro
      setDragX(0);
    }
  };

  const resetCard = () => {
    setDragX(0);
    setExitDirection(null);
  };

  // Like/Dislike via botões
  const handleLikeClick = () => {
    setExitDirection("right");
    setTimeout(() => {
      onLike();
      resetCard();
    }, 450);
  };

  const handleDislikeClick = () => {
    setExitDirection("left");
    setTimeout(() => {
      onDislike();
      resetCard();
    }, 450);
  };

  // Calcular opacidade do overlay baseado no arraste
  const likeOpacity = isDragging && dragX > 20 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0;
  const dislikeOpacity = isDragging && dragX < -20 ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0;

  // Rotação durante o arraste
  const rotation = isDragging ? dragX * 0.08 : 0;

  const cardStyle = exitDirection
    ? {}
    : {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      };

  const cardClass = `swipe-card ${exitDirection === "right" ? "swipe-right" : ""} ${exitDirection === "left" ? "swipe-left" : ""}`;

  return (
    <>
      <div className="swipe-wrapper">
        <div
          ref={cardRef}
          className={cardClass}
          style={cardStyle}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Overlays de like/dislike */}
          <div className="swipe-overlay like-overlay" style={{ opacity: likeOpacity }}>
            <span className="overlay-icon">❤️</span>
          </div>
          <div className="swipe-overlay dislike-overlay" style={{ opacity: dislikeOpacity }}>
            <span className="overlay-icon">✖️</span>
          </div>

          {/* Imagem */}
          <div className="pet-image-container">
            <img className="pet-image" src={pet.foto} alt={pet.nome} />
            {pet.compatibilidade !== undefined && (
              <span className={`compatibility-badge ${getCompatibilityClass()}`}>
                {pet.compatibilidade}% compatível
              </span>
            )}
          </div>

          {/* Informações */}
          <div className="pet-info">
            <h3 className="pet-name">{pet.nome}</h3>
            <p className="pet-breed">
              🐾 {pet.especie} • {pet.idade ? `${pet.idade} anos` : "Idade não informada"}
            </p>
            <div className="pet-tags">
              {pet.porte && <span className="pet-tag">📏 {pet.porte}</span>}
              {pet.sexo && <span className="pet-tag">{pet.sexo === "Macho" || pet.sexo === "M" ? "♂️" : "♀️"} {pet.sexo}</span>}
              {pet.local && <span className="pet-tag">📍 {pet.local}</span>}
              {pet.vacinado && <span className="pet-tag">💉 {pet.vacinado}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="action-buttons">
        <button
          className="action-btn dislike-btn"
          onClick={handleDislikeClick}
          aria-label="Não curtir"
        >
          ✖️
        </button>
        <button
          className="action-btn like-btn"
          onClick={handleLikeClick}
          aria-label="Curtir"
        >
          ❤️
        </button>
      </div>
    </>
  );
}
