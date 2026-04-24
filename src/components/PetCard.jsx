import React from "react";
import "./PetApp.css";

export default function PetCard({ pet }) {
  return (
    <div className="pet-card">
      <img className="pet-image" src={pet.image} alt={pet.name} />
      <div className="pet-info">
        <h3>{pet.name}</h3>
        <p>{pet.description}</p>
      </div>
    </div>
  );
}
