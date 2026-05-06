import React, { useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import PetCard from "./PetCard";
import "./PetApp.css";

export default function PetApp() {
  const pets = useWebSocket();
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (pets.length === 0) {
    return <p>Nenhum pet disponível no momento.</p>;
  }

  const petAtual = pets[index];

  const handleLike = () => setShowModal(true);
  const handleDislike = () => setIndex((prev) => (prev + 1) % pets.length);

  return (
    <div className="tinder-container">
      <div className="tinder-card">
        <PetCard pet={petAtual} />
      </div>

      <div className="tinder-actions">
        <button className="dislike" onClick={handleDislike}>👎</button>
        <button className="like" onClick={handleLike}>👍</button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{petAtual.name}</h3>
            <p>{petAtual.breed}</p>
            <p>{petAtual.age ? petAtual.age + " anos" : "idade não informada"}</p>
            <p>{petAtual.description}</p>
            <button className="adopt-btn">Quero Adotar</button>
            <button className="close-btn" onClick={() => setShowModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
