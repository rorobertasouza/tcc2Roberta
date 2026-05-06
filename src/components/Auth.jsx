import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Register from "./Register";
import "./Auth.css";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Tentando login...");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://localhost/find-animal-friend-react/api/login.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.text())
      .then(text => {
        console.log("RESPOSTA API:", text);

        try {
          const data = JSON.parse(text);

          if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/home");
          } else {
            alert(data.message || data.erro || "Login inválido");
          }
        } catch (err) {
          console.error("Erro ao converter JSON:", err);
          alert("Erro no servidor");
        }
      })
      .catch(err => {
        console.error("Erro real:", err);
        alert("Erro de conexão");
      });
  };

  if (isRegister) {
    return <Register onBack={() => setIsRegister(false)} />;
  }

  return (
    <div className="auth-container">
      <h1 className="app-title">Find Animal Friend</h1>

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>
      </form>

      <div className="signup-link" onClick={() => setIsRegister(true)}>
        Criar conta
      </div>
    </div>
  );
}
