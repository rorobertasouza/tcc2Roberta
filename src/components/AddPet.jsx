import React, { useState } from "react";

export default function AddPet() {
  const [pet, setPet] = useState({ name: "", breed: "", age: "", description: "" });

  const handleChange = (e) => {
    setPet({ ...pet, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost/find-animal-friend-react/api/add_pet.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pet),
    });
    alert("Pet adicionado com sucesso!");
  };

  return (
    <div className="form-container">
      <h2>Adicionar Pet</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nome" onChange={handleChange} />
        <input name="breed" placeholder="Raça" onChange={handleChange} />
        <input name="age" placeholder="Idade" onChange={handleChange} />
        <input name="description" placeholder="Descrição" onChange={handleChange} />
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
