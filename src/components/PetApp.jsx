import React, { useEffect, useState } from "react";
import PetCard from "./PetCard";
import "./PetApp.css"; // Importa o CSS

function PetApp() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetch("http://localhost/find-animal-friend-react/api/pets.php")
      .then((res) => res.json())
      .then((data) => setPets(data))
      .catch((err) => console.error("Erro ao buscar pets:", err));
  }, []);

  return (
    <div className="app">
      <div className="pet-container">
        {pets.length > 0 ? (
          pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
        ) : (
          <p>Carregando pets...</p>
        )}
      </div>
    </div>
  );
}

export default PetApp;
