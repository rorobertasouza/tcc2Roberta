import React from "react";

export default function PetCard({ pet }) {
  return (
    <div className="card">
      <img src={pet.image} alt={pet.name} />
      <h3>{pet.name}</h3>
      <p>{pet.breed} - {pet.age ? pet.age + " anos" : "idade não informada"}</p>
      <p>{pet.description}</p>
    </div>
  );
}
