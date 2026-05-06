import React, { useState } from "react";

export default function CadastroPet() {
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [especie, setEspecie] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState("");
  const [contato, setContato] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const novoPet = {
      nome,
      idade,
      especie,
      descricao,
      foto,
      contato,
    };

    console.log("Pet cadastrado:", novoPet);

    alert("Pet cadastrado com sucesso!");
    // Aqui você envia para sua API PHP/MySQL
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Cadastro de Pet</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Idade:
          <input
            type="number"
            value={idade}
            onChange={(e) => setIdade(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Espécie/Raça:
          <input
            type="text"
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Descrição:
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Foto (URL):
          <input
            type="text"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Contato:
          <input
            type="email"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            required
          />
        </label>
        <br />

        <button type="submit">Cadastrar Pet</button>
      </form>
    </div>
  );
}
