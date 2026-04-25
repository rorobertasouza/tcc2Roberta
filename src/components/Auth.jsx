import React, { useState } from "react";
import Register from "./Register";
import "./Auth.css";

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("senha", password); // <-- corrigido

   fetch("http://localhost/find-animal-friend-react/api/login.php", {
  method: "POST",
  body: formData,
  credentials: "include"
})
      .then(res => res.text())
      .then(text => {
        console.log("Resposta bruta do PHP:", text);
        try {
          const data = JSON.parse(text);
          if (data.success) {
            alert(data.message);
            onLoginSuccess();
          } else {
            alert(data.message || "Login inválido");
          }
        } catch (err) {
          console.error("Erro ao parsear JSON:", err);
          alert("Erro inesperado na resposta do servidor.");
        }
      })
      .catch(err => console.error("Erro na requisição:", err));
  };

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
