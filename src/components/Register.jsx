import React, { useState } from "react";
import "./Auth.css";

export default function Register({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://localhost/find-animal-friend-react/api/register.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Cadastro realizado com sucesso!");
          onBack(); // volta para login
        } else {
          alert(data.message);
        }
      })
      .catch(err => console.error("Erro:", err));
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">Cadastro</h1>

      <form className="auth-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Cadastrar</button>
      </form>

      <div className="signup-link" onClick={onBack}>
        Já tem conta? Entrar
      </div>
    </div>
  );
}
