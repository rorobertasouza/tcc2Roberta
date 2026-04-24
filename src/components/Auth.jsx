import React, { useState } from "react";
import "./Auth.css";

export default function Auth({ onLoginSuccess, onShowRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (username && password) {
      onLoginSuccess();
    } else {
      alert("Preencha usuário e senha!");
    }
  }

  return (
    <div className="auth-container">
      <h1 className="app-title">Find Friend Animal</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Entrar</button>
      </form>
      <p className="signup-link" onClick={onShowRegister}>
        Cadastre-se
      </p>
    </div>
  );
}
