import React, { useState } from "react";

export default function OngRegister() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost/find-animal-friend-react/api/ong_register.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    alert("ONG cadastrada com sucesso!");
  };

  return (
    <div className="form-container">
      <h2>Cadastro de ONG</h2>
      <form onSubmit={handleSubmit}>
        <input name="nome" placeholder="Nome da ONG" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="senha" placeholder="Senha" onChange={handleChange} />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
