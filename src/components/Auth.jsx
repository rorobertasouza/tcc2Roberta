import React, { useState } from "react";
import Register from "./Register";
import "./Auth.css"; // importa o CSS estilizado

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://localhost/find-animal-friend-react/api/login.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          onLoginSuccess();
        } else {
          alert("Login inválido");
        }
      })
      .catch(err => console.error("Erro:", err));
  };

  // Se não está em login, mostra o componente de cadastro
  if (!isLogin) return <Register onBack={() => setIsLogin(true)} />;

  return (
    <div className="auth-container">
      <h1 className="app-title">Find Friend Animal</h1>

      <form className="auth-form" onSubmit={handleLogin}>
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
        <button type="submit">Entrar</button>
      </form>

      <div className="signup-link" onClick={() => setIsLogin(false)}>
        Criar conta
      </div>
    </div>
  );
}
