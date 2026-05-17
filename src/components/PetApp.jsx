import React, { useState, useEffect } from "react";
import SwipeCard from "./SwipeCard";
import MatchScreen from "./MatchScreen";
import "./PetApp.css";
import "./SwipeCard.css";

const API_BASE = "http://localhost/find-animal-friend-react/api";

export default function PetApp() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id;

  const [pets, setPets] = useState([]);
  const [index, setIndex] = useState(0);
  const [matchData, setMatchData] = useState(null); // { pet, whatsappUrl }
  const [loading, setLoading] = useState(true);

  // Buscar pets filtrados por preferências do usuário
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = () => {
    setLoading(true);
    const url = userId
      ? `${API_BASE}/pets.php?user_id=${userId}`
      : `${API_BASE}/pets.php`;

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
      })
      .catch((err) => {
        console.error("Erro ao buscar pets:", err);
        setLoading(false);
      });
  };

  const handleLike = () => {
    const pet = pets[index];

    // Salvar like na API
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
          // Mostrar tela de match com dados do pet (usa dados locais como fallback)
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
    const pet = pets[index];

    // Salvar dislike na API
    fetch(`${API_BASE}/match.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet_id: pet.id, action: "dislike", user_id: userId }),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Erro ao registrar dislike:", err));

    // Avançar para o próximo pet
    advanceToNext();
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
        </div>
      </div>
    );
  }

  // Sem pets ou acabaram todos
  const hasMorePets = index < pets.length;

  return (
    <div className="tinder-container">
      {hasMorePets ? (
        <SwipeCard
          key={pets[index].id}
          pet={pets[index]}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      ) : (
        <div className="no-more-pets">
          <span className="empty-icon">🐾</span>
          <h3>Você viu todos os pets!</h3>
          <p>
            Não há mais pets compatíveis com suas preferências no momento.
            Volte mais tarde para novas adições!
          </p>
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
