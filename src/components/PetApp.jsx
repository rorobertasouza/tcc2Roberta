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
  return Math.round(R * c * 10) / 10; // 1 decimal place
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

    // Adicionar coordenadas se disponíveis
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

  const handleLike = () => {
    const pet = availablePets[index];
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
          advanceToNext();
        }
      })
      .catch((err) => {
        console.error("Erro ao registrar like:", err);
        advanceToNext();
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
          {geo.loading && <p className="geo-status">📍 Obtendo sua localização...</p>}
        </div>
      </div>
    );
  }

  // Filtrar pets não adotados para swipe e calcular distância em tempo real
  const availablePets = pets
    .map(p => {
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
    })
    .filter(p => p.adotado !== 1);
  const hasMorePets = index < availablePets.length;

  return (
    <div className="tinder-container">
      {hasMorePets ? (
        <SwipeCard
          key={availablePets[index].id}
          pet={availablePets[index]}
          onLike={handleLike}
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
              🔄 Resetar Escolhas
            </button>
            <button className="logout-btn-home" onClick={handleLogout}>
              🚪 Sair da Conta
            </button>
          </div>
        </div>
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
