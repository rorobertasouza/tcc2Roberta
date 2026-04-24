import React, { useState, useEffect } from "react";
import "./PetApp.css";

export default function PetApp() {
  const [pets, setPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedPet, setLikedPet] = useState(null);

  useEffect(() => {
    fetch("http://localhost/find-animal-friend-react/api/pets.php")
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(err => console.error("Erro:", err));
  }, []);

  const handleLike = () => {
    setLikedPet(pets[currentIndex]);
  };

  const handleDislike = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const closeDetails = () => {
    setLikedPet(null);
    setCurrentIndex(prev => prev + 1);
  };

  if (!pets || pets.length === 0) {
    return <h2>Carregando pets...</h2>;
  }

  const pet = pets[currentIndex];
  if (!pet) return <h2>Não há mais pets</h2>;

  return (
    <div className="pet-container">
      <h2 className="app-title">Find Friend Animal</h2>

      <div className="pet-card">
        <img className="pet-image" src={pet.image} alt={pet.name} />
        <div className="pet-info">
          <h3>{pet.name}</h3>
          <p>{pet.description}</p>
        </div>
      </div>

      <div className="actions">
        <button className="dislike" onClick={handleDislike}>👎</button>
        <button className="like" onClick={handleLike}>❤️</button>
      </div>

      {likedPet && (
        <div className="modal">
          <div className="modal-content">
            <img src={likedPet.image} alt={likedPet.name} className="modal-image" />
            <h2 className="modal-title">{likedPet.name}</h2>
            <p className="modal-description">{likedPet.description}</p>

            <ul className="pet-details-list">
              <li>📅 <strong>Idade:</strong> {likedPet.age} anos</li>
              <li>🐾 <strong>Raça:</strong> {likedPet.breed}</li>
              <li>📏 <strong>Porte:</strong> {likedPet.size}</li>
              <li>⚧ <strong>Sexo:</strong> {likedPet.gender}</li>
              <li>📍 <strong>Localização:</strong> {likedPet.location}</li>
              <li>💉 <strong>Vacinado:</strong> {likedPet.vaccinated}</li>
              <li>✂️ <strong>Castrado:</strong> {likedPet.neutered}</li>
              <li>📧 <strong>Contato:</strong> {likedPet.contact}</li>
            </ul>

            <div className="modal-actions">
              <a
  href={`mailto:${likedPet.contact}?subject=Interesse em adotar ${likedPet.name}&body=Olá, tenho interesse em adotar ${likedPet.name}.`}
  className="adopt-btn"
>
  Quero Adotar 🐶
</a>

              <button className="close-btn" onClick={closeDetails}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
