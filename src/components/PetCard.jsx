import React from "react";
import "./PetApp.css";

function PetCard({ pet }) {
  return (
    <div className="card">
      <img src={pet.foto} alt={pet.nome} />
      <div className="card-info">
        <h2>{pet.nome}</h2>
        <p>{pet.raca}</p>
        <div className="actions">
          <button className="pass">❌</button>
          <button className="like">❤️</button>
        </div>
      </div>
    </div>
  );
}

export default PetCard;
