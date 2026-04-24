import React from "react";

function PetCard({ pet }) {
  return (
    <div className="card">
      <img src={pet.image} alt={pet.name} />

      <h3>{pet.name}</h3>
      <p>{pet.description}</p>

      <div className="actions">
        <button>❌</button>
        <button>❤️</button>
      </div>
    </div>
  );
}

export default PetCard;