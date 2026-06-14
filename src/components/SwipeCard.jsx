import React, { useState, useRef, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./SwipeCard.css";

// Fix Leaflet default marker icons (webpack/vite issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const petIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// ── Map Modal Component ──
function MapModal({ pet, userLocation, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const petLat = pet.latitude ? Number(pet.latitude) : null;
  const petLng = pet.longitude ? Number(pet.longitude) : null;
  const userLat = userLocation?.latitude || null;
  const userLng = userLocation?.longitude || null;

  const hasPetLocation = petLat !== null && petLng !== null;
  const hasUserLocation = userLat !== null && userLng !== null;
  const distance = hasPetLocation && hasUserLocation
    ? getHaversineDistance(userLat, userLng, petLat, petLng)
    : null;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const centerLat = hasPetLocation ? petLat : hasUserLocation ? userLat : -23.55;
    const centerLng = hasPetLocation ? petLng : hasUserLocation ? userLng : -46.63;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const bounds = [];

    if (hasPetLocation) {
      L.marker([petLat, petLng], { icon: petIcon })
        .addTo(map)
        .bindPopup(`<strong>${pet.nome}</strong><br/>${pet.local || pet.especie || ''}`);
      bounds.push([petLat, petLng]);
    }

    if (hasUserLocation) {
      L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<strong>Sua localização</strong>');
      bounds.push([userLat, userLng]);
    }

    if (hasPetLocation && hasUserLocation) {
      L.polyline([[userLat, userLng], [petLat, petLng]], {
        color: '#fe3c72',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.7,
      }).addTo(map);
    }

    if (bounds.length === 2) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    }

    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="map-modal-overlay" onClick={onClose}>
      <div className="map-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="map-modal-close" onClick={onClose}>✕</button>

        <div className="map-modal-header">
          <h3>Localização de {pet.nome}</h3>
          {distance !== null && (
            <span className="map-distance-badge">
              {distance} km de distância
            </span>
          )}
        </div>

        <div className="map-container" ref={mapRef}></div>

        <div className="map-legend">
          <div className="map-legend-item">
            <span className="legend-dot pet-dot"></span>
            <span>{pet.nome} {pet.local ? `(${pet.local})` : ''}</span>
          </div>
          {hasUserLocation && (
            <div className="map-legend-item">
              <span className="legend-dot user-dot"></span>
              <span>Sua localização</span>
            </div>
          )}
          {!hasPetLocation && (
            <p className="map-no-location">Localização do pet não disponível no mapa</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Fallback image placeholder ──
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' font-family='Arial' font-size='48' fill='%23ccc'%3E%F0%9F%90%BE%3C/text%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImagem indispon%C3%ADvel%3C/text%3E%3C/svg%3E";

export default function SwipeCard({ pet, onLike, onDislike, onFavorite, onFavoriteAndAdvance, isFavorited, userLocation }) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showBio, setShowBio] = useState(false);
  const [imgError, setImgError] = useState(false);
  const startX = useRef(0);
  const hasMoved = useRef(false);
  const cardRef = useRef(null);

  const SWIPE_THRESHOLD = 100;
  const isAdopted = pet.adotado === 1;

  const getCompatibilityClass = () => {
    if (!pet.compatibilidade) return "";
    if (pet.compatibilidade >= 80) return "high";
    if (pet.compatibilidade >= 50) return "medium";
    return "";
  };

  // Drag handlers
  const handlePointerDown = (e) => {
    if (isAdopted) return;
    if (e.target.closest('button')) return;
    if (e.target.closest('.map-hint-badge')) return;
    if (e.target.closest('.bio-section')) return;
    startX.current = e.clientX;
    hasMoved.current = false;
    setIsDragging(true);
    if (cardRef.current) {
      cardRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 5) hasMoved.current = true;
    setDragX(delta);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD) {
      setExitDirection("right");
      setTimeout(() => {
        onLike();
        resetCard();
      }, 450);
    } else if (dragX < -SWIPE_THRESHOLD) {
      setExitDirection("left");
      setTimeout(() => {
        onDislike();
        resetCard();
      }, 450);
    } else {
      setDragX(0);
    }
  };

  const resetCard = () => {
    setDragX(0);
    setExitDirection(null);
  };

  const handleLikeClick = () => {
    if (isAdopted) return;
    setExitDirection("right");
    setTimeout(() => {
      onLike();
      resetCard();
    }, 450);
  };

  const handleDislikeClick = () => {
    if (isAdopted) return;
    setExitDirection("left");
    setTimeout(() => {
      onDislike();
      resetCard();
    }, 450);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavorite) onFavorite(pet.id);
  };

  const handleFavoriteAndAdvance = (e) => {
    e.stopPropagation();
    if (onFavoriteAndAdvance) {
      setExitDirection("fav");
      setTimeout(() => {
        onFavoriteAndAdvance(pet.id);
        resetCard();
      }, 450);
    } else {
      handleFavoriteClick(e);
    }
  };

  const likeOpacity = isDragging && dragX > 20 ? Math.min(dragX / SWIPE_THRESHOLD, 1) : 0;
  const dislikeOpacity = isDragging && dragX < -20 ? Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) : 0;

  const rotation = isDragging ? dragX * 0.08 : 0;

  const cardStyle = exitDirection
    ? {}
    : {
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      };

  const cardClass = `swipe-card ${exitDirection === "right" ? "swipe-right" : ""} ${exitDirection === "left" ? "swipe-left" : ""} ${exitDirection === "fav" ? "swipe-fav" : ""} ${isAdopted ? "adopted" : ""}`;

  const hasBioInfo = pet.origem || pet.motivo_adocao || pet.tempo_aguardando || pet.descricao;

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

          {/* Overlay de adotado */}
          {isAdopted && (
            <div className="adopted-overlay">
              <div className="adopted-badge-big">
                <span>Adotado!</span>
              </div>
              <p className="adopted-msg">Este pet já encontrou um lar!</p>
            </div>
          )}

          {/* Imagem — clique abre o mapa */}
          <div className="pet-image-container">
            <img
              className="pet-image"
              src={imgError ? FALLBACK_IMAGE : pet.foto}
              alt={pet.nome}
              onError={() => setImgError(true)}
              onPointerUp={(e) => {
                if (!hasMoved.current && !exitDirection) {
                  e.stopPropagation();
                  setShowMap(true);
                }
              }}
              style={{ cursor: 'pointer' }}
            />
            <div
              className="map-hint-badge"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setShowMap(true); }}
            >
              Ver no mapa
            </div>
            
            {/* Badge de compatibilidade ou adotado */}
            {isAdopted ? (
              <span className="compatibility-badge adopted">
                Adotado
              </span>
            ) : pet.compatibilidade !== undefined ? (
              <span className={`compatibility-badge ${getCompatibilityClass()}`}>
                {pet.compatibilidade}% compatível
              </span>
            ) : null}

            {/* Badge de interessados (fila de adoção) */}
            {pet.interessados > 0 && !isAdopted && (
              <span className="interest-badge">
                {pet.interessados} interessado{pet.interessados > 1 ? "s" : ""}
              </span>
            )}

          </div>

          {/* Informações */}
          <div className="pet-info">
            <h3 className="pet-name">{pet.nome}</h3>
            <p className="pet-breed">
              {pet.especie} · {pet.idade ? `${pet.idade} anos` : "Idade não informada"}
            </p>
            <div className="pet-tags">
              {pet.porte && <span className="pet-tag">{pet.porte}</span>}
              {pet.sexo && <span className="pet-tag">{pet.sexo === "Macho" || pet.sexo === "M" ? "♂" : "♀"} {pet.sexo}</span>}
              {pet.distancia_km !== null && pet.distancia_km !== undefined ? (
                <span className="pet-tag distance-tag">{pet.distancia_km} km</span>
              ) : pet.local ? (
                <span className="pet-tag">{pet.local}</span>
              ) : null}
              {pet.vacinado && <span className="pet-tag">{pet.vacinado === "sim" ? "Vacinado" : pet.vacinado}</span>}
              {pet.tempo_aguardando && (
                <span className="pet-tag waiting-tag">Aguarda há {pet.tempo_aguardando}</span>
              )}
            </div>

            {/* Bio toggle */}
            {hasBioInfo && (
              <button
                className="bio-toggle-btn"
                onClick={(e) => { e.stopPropagation(); setShowBio(!showBio); }}
              >
                {showBio ? "Menos detalhes ▲" : "Mais detalhes ▼"}
              </button>
            )}

            {/* Biografia expandida */}
            {showBio && (
              <div className="bio-section" onPointerDown={(e) => e.stopPropagation()}>
                {pet.descricao && (
                  <div className="bio-item">
                    <span className="bio-label">Sobre</span>
                    <p className="bio-text">{pet.descricao}</p>
                  </div>
                )}
                {pet.origem && (
                  <div className="bio-item">
                    <span className="bio-label">Origem</span>
                    <p className="bio-text">{pet.origem}</p>
                  </div>
                )}
                {pet.motivo_adocao && (
                  <div className="bio-item">
                    <span className="bio-label">Motivo para adoção</span>
                    <p className="bio-text">{pet.motivo_adocao}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="action-buttons">
        <button
          className="action-btn dislike-btn"
          onClick={handleDislikeClick}
          aria-label="Não curtir"
          disabled={isAdopted}
        >
          ✕
        </button>
        <button
          className={`action-btn fav-action-btn ${isFavorited ? "favorited" : ""}`}
          onClick={handleFavoriteAndAdvance}
          aria-label="Favoritar e avançar"
        >
          {isFavorited ? "★" : "☆"}
        </button>
        <button
          className="action-btn like-btn"
          onClick={handleLikeClick}
          aria-label="Curtir"
          disabled={isAdopted}
        >
          ❤
        </button>
      </div>

      {/* Modal do Mapa */}
      {showMap && (
        <MapModal
          pet={pet}
          userLocation={userLocation}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
}
