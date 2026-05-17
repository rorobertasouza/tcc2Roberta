import React from "react";
import "./PetApp.css";

export default function PetCard({ pet }) {
  return (
    <div className="pet-card">
      <img src={pet.foto} alt={pet.nome} />
      <h3>{pet.nome}</h3>
      <p>{pet.descricao}</p>
      <span>{pet.idade ? `${pet.idade} anos` : "Idade não informada"}</span>
      <p><strong>Espécie:</strong> {pet.especie}</p>
      <p><strong>Porte:</strong> {pet.porte}</p>
      <p><strong>Sexo:</strong> {pet.sexo}</p>
      <p><strong>Local:</strong> {pet.local}</p>
      <p><strong>Contato:</strong> {pet.contato}</p>
      <p><strong>Vacinado:</strong> {pet.vacinado}</p>
      <p><strong>Castrado:</strong> {pet.castrado}</p>
    </div>
  );
}
