import React, { useState } from "react";
import Register from "./Register";
import "./PetApp"; // IMPORTANTE

function Auth({ onLoginSuccess }) {
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
      });
  };

  if (!isLogin) return <Register onBack={() => setIsLogin(true)} />;

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Entrar</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            onChange={e => setPassword(e.target.value)}
          />

          <button type="submit">Entrar</button>
        </form>

        <p className="link" onClick={() => setIsLogin(false)}>
          Criar conta
        </p>
      </div>
    </div>
  );
}

export default Auth;