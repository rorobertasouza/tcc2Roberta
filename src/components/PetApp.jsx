import React, { useEffect, useState } from "react";
import SwipeCard from "./SwipeCard";
import MatchScreen from "./MatchScreen";
import useWebSocket from "../hooks/useWebSocket";
import useGeolocation from "../hooks/useGeolocation";
import "./PetApp.css";
import "./SwipeCard.css";
import { API_BASE } from "../config.js";
import { useNavigate } from "react-router-dom";

function getHaversineDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ── Fallback image ──
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='45%25' text-anchor='middle' font-family='Arial' font-size='48' fill='%23ccc'%3E%F0%9F%90%BE%3C/text%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' font-family='Arial' font-size='16' fill='%23999'%3EImagem indispon%C3%ADvel%3C/text%3E%3C/svg%3E";

// ── List Card Component ──
function ListCard({ pet, onLike, onFavorite, isFavorited }) {
  const [imgError, setImgError] = useState(false);
  const isAdopted = pet.adotado === 1;

  return (
    <div className={`list-card ${isAdopted ? "list-card-adopted" : ""}`}>
      <div className="list-card-img-wrap">
        <img
          className="list-card-img"
          src={imgError ? FALLBACK_IMAGE : pet.foto}
          alt={pet.nome}
          onError={() => setImgError(true)}
        />
        {isAdopted && <span className="list-adopted-badge">Adotado</span>}
        {pet.compatibilidade !== undefined && !isAdopted && (
          <span className={`list-compat-badge ${pet.compatibilidade >= 80 ? "high" : pet.compatibilidade >= 50 ? "medium" : ""}`}>
            {pet.compatibilidade}%
          </span>
        )}
      </div>
      <div className="list-card-body">
        <h4 className="list-card-name">{pet.nome}</h4>
        <p className="list-card-breed">
          {pet.especie} {pet.idade ? `· ${pet.idade} anos` : ""}
        </p>
        <div className="list-card-tags">
          {pet.porte && <span className="list-tag">{pet.porte}</span>}
          {pet.sexo && <span className="list-tag">{pet.sexo === "Macho" || pet.sexo === "M" ? "♂" : "♀"} {pet.sexo}</span>}
          {pet.distancia_km !== null && pet.distancia_km !== undefined && (
            <span className="list-tag list-tag-distance">{pet.distancia_km} km</span>
          )}
          {pet.local && !pet.distancia_km && <span className="list-tag">{pet.local}</span>}
        </div>
        {pet.tempo_aguardando && (
          <p className="list-card-waiting">Aguarda há {pet.tempo_aguardando}</p>
        )}
        {pet.interessados > 0 && !isAdopted && (
          <p className="list-card-interest">{pet.interessados} interessado{pet.interessados > 1 ? "s" : ""}</p>
        )}
        <div className="list-card-actions">
          <button
            className={`list-fav-btn ${isFavorited ? "active" : ""}`}
            onClick={() => onFavorite(pet.id)}
            title={isFavorited ? "Remover favorito" : "Favoritar"}
          >
            {isFavorited ? "★" : "☆"}
          </button>
          {!isAdopted && (
            <button
              className="list-like-btn"
              onClick={() => onLike(pet)}
            >
              Curtir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PetApp() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const userId = storedUser?.id;
  const { pets: wsPets, adoptPet, toggleFavorite, favoritePetIds } = useWebSocket(userId);
  const geo = useGeolocation(userId);
  const navigate = useNavigate();

  const [pets, setPets] = useState([]);
  const [index, setIndex] = useState(0);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [viewMode, setViewMode] = useState("swipe"); // "swipe" or "list"
  const [filters, setFilters] = useState({
    especie: "",
    porte: "",
    sexo: "",
  });

  useEffect(() => {
    if (wsPets.length > 0) {
      setPets(wsPets);
      setLoading(false);
      setHasFetched(true);
    }
  }, [wsPets]);

  useEffect(() => {
    if (hasFetched) return;
    fetchPets();
  }, [hasFetched]);

  const fetchPets = () => {
    setLoading(true);
    let url = userId
      ? `${API_BASE}/pets.php?user_id=${userId}`
      : `${API_BASE}/pets.php`;

    if (geo.latitude && geo.longitude) {
      url += `&user_lat=${geo.latitude}&user_lng=${geo.longitude}`;
    }

    fetch(url, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPets(data);
        }
        setLoading(false);
        setHasFetched(true);
      })
      .catch((err) => {
        console.error("Erro ao buscar pets:", err);
        setLoading(false);
        setHasFetched(true);
      });
  };

  const handleLike = (petOverride) => {
    const pet = petOverride || availablePets[index];
    if (!pet) return;

    fetch(`${API_BASE}/match.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: pet.id, action: "like", user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Match response:", data);
        if (data.success) {
          setMatchData({
            pet: data.pet || pet,
            whatsappUrl: data.whatsapp_url || "#",
          });
        } else {
          console.error("Erro no match:", data.message);
          if (!petOverride) advanceToNext();
        }
      })
      .catch((err) => {
        console.error("Erro ao registrar like:", err);
        if (!petOverride) advanceToNext();
      });
  };

  const handleDislike = () => {
    const pet = availablePets[index];
    if (!pet) return;

    fetch(`${API_BASE}/match.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: pet.id, action: "dislike", user_id: userId }),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Erro ao registrar dislike:", err));

    advanceToNext();
  };

  const handleFavorite = (petId) => {
    toggleFavorite(petId);
  };

  const handleFavoriteAndAdvance = (petId) => {
    toggleFavorite(petId);
    advanceToNext();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleResetChoices = () => {
    if (!window.confirm("Resetar todas as escolhas? Você verá todos os pets novamente.")) return;
    fetch(`${API_BASE}/reset_matches.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIndex(0);
          setHasFetched(false);
        }
      })
      .catch(err => console.error("Erro ao resetar:", err));
  };

  const advanceToNext = () => {
    setIndex((prev) => prev + 1);
  };

  const handleCloseMatch = () => {
    setMatchData(null);
    advanceToNext();
  };

  // Loading state
  if (loading) {
    return (
      <div className="tinder-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Buscando pets compatíveis...</p>
          {geo.loading && <p className="geo-status">Obtendo sua localização...</p>}
        </div>
      </div>
    );
  }

  // Filtrar pets não adotados para swipe e calcular distância em tempo real
  const allPets = pets.map(p => {
    const petLat = p.latitude !== null && p.latitude !== undefined ? Number(p.latitude) : null;
    const petLng = p.longitude !== null && p.longitude !== undefined ? Number(p.longitude) : null;
    const distance = geo.latitude && geo.longitude && petLat !== null && petLng !== null
      ? getHaversineDistance(geo.latitude, geo.longitude, petLat, petLng)
      : (p.distancia_km !== null && p.distancia_km !== undefined ? Number(p.distancia_km) : null);

    return {
      ...p,
      id: Number(p.id),
      distancia_km: distance
    };
  });

  const availablePets = allPets.filter(p => p.adotado !== 1);

  // Apply filters for list mode
  const filteredPets = availablePets.filter(p => {
    if (filters.especie) {
      const breed = (p.especie || "").toLowerCase();
      if (filters.especie === "cachorro" && breed.includes("gato")) return false;
      if (filters.especie === "gato" && !breed.includes("gato")) return false;
    }
    if (filters.porte) {
      const size = (p.porte || "").toLowerCase();
      if (!size.includes(filters.porte)) return false;
    }
    if (filters.sexo) {
      const gender = (p.sexo || "").toLowerCase();
      const filterSexo = filters.sexo.toLowerCase();
      if (filterSexo === "macho" && !["macho", "m"].includes(gender)) return false;
      if (filterSexo === "fêmea" && !["fêmea", "femea", "f"].includes(gender)) return false;
    }
    return true;
  });

  const hasMorePets = index < availablePets.length;

  return (
    <div className="tinder-container">
      {/* View mode toggle */}
      <div className="view-mode-toggle">
        <button
          className={`mode-btn ${viewMode === "swipe" ? "active" : ""}`}
          onClick={() => setViewMode("swipe")}
        >
          Cards
        </button>
        <button
          className={`mode-btn ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          Lista
        </button>
      </div>

      {viewMode === "swipe" ? (
        /* ── Swipe Mode ── */
        hasMorePets ? (
          <SwipeCard
            key={availablePets[index].id}
            pet={availablePets[index]}
            onLike={() => handleLike()}
            onDislike={handleDislike}
            onFavorite={handleFavorite}
            onFavoriteAndAdvance={handleFavoriteAndAdvance}
            isFavorited={favoritePetIds.has(availablePets[index].id)}
            userLocation={geo}
          />
        ) : (
          <div className="no-more-pets">
            <span className="empty-icon">🐾</span>
            <h3>Você viu todos os pets!</h3>
            <p>
              Não há mais pets compatíveis com suas preferências no momento.
              Volte mais tarde para novas adições!
            </p>
            <div className="no-more-actions">
              <button className="reset-btn" onClick={handleResetChoices}>
                Resetar Escolhas
              </button>
              <button className="logout-btn-home" onClick={handleLogout}>
                Sair da Conta
              </button>
            </div>
          </div>
        )
      ) : (
        /* ── List Mode ── */
        <>
          <div className="list-filters">
            <select
              value={filters.especie}
              onChange={e => setFilters(f => ({ ...f, especie: e.target.value }))}
              className="filter-select"
            >
              <option value="">Todas espécies</option>
              <option value="cachorro">Cachorro</option>
              <option value="gato">Gato</option>
            </select>
            <select
              value={filters.porte}
              onChange={e => setFilters(f => ({ ...f, porte: e.target.value }))}
              className="filter-select"
            >
              <option value="">Todos portes</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
            <select
              value={filters.sexo}
              onChange={e => setFilters(f => ({ ...f, sexo: e.target.value }))}
              className="filter-select"
            >
              <option value="">Todos sexos</option>
              <option value="macho">Macho</option>
              <option value="fêmea">Fêmea</option>
            </select>
          </div>

          {filteredPets.length === 0 ? (
            <div className="no-more-pets">
              <span className="empty-icon">🔍</span>
              <h3>Nenhum pet encontrado</h3>
              <p>Tente ajustar os filtros para encontrar mais opções.</p>
            </div>
          ) : (
            <div className="list-grid">
              {filteredPets.map(pet => (
                <ListCard
                  key={pet.id}
                  pet={pet}
                  onLike={() => handleLike(pet)}
                  onFavorite={handleFavorite}
                  isFavorited={favoritePetIds.has(pet.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Tela de Match */}
      {matchData && (
        <MatchScreen
          pet={matchData.pet}
          whatsappUrl={matchData.whatsappUrl}
          onClose={handleCloseMatch}
        />
      )}
    </div>
  );
}
