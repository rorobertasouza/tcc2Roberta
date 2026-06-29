import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Register from "./Register.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import { API_BASE } from "../config.js";
import { useAuth } from "../context/AuthContext.tsx";
import "../styles.css";

export default function Auth() {
  const { loginUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch(`${API_BASE}/login.php`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((text) => {
        const data = JSON.parse(text);
        if (data.success) {
          loginUser(data.user);
          navigate("/home");
        } else {
          setError(data.message || data.erro || "Email ou senha inválidos");
        }
      })
      .catch(() => setError("Erro de conexão. Tente novamente."))
      .finally(() => setLoading(false));
  };

  if (isForgotPassword) {
    return <ForgotPassword onBack={() => setIsForgotPassword(false)} />;
  }

  if (isRegister) {
    return <Register onBack={() => setIsRegister(false)} />;
  }

  return (
    <div className="auth-screen">
      {/* Logo */}
      <h1 className="auth-logo">Find Animal Friend</h1>
      <p className="auth-tagline">Encontre seu companheiro perfeito</p>

      {/* Card de login */}
      <div className="auth-card">
        <h2>Entrar</h2>

        {error && (
          <div style={{
            background: "#fff0f3",
            border: "1px solid rgba(254,60,114,.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            color: "var(--brand-primary)",
            fontSize: "0.88rem",
            fontWeight: 600,
            marginBottom: "14px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Senha</label>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brand-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  marginBottom: "6px"
                }}
              >
                Esqueceu a senha?
              </button>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {/* Links de rodapé */}
      <div className="auth-footer">
        <span>Novo por aqui? </span>
        <button onClick={() => setIsRegister(true)}>Criar conta</button>
      </div>

      <div className="auth-footer" style={{ marginTop: "10px" }}>
        <Link
          to="/ong-login"
          style={{ color: "var(--text-secondary)", fontSize: "0.83rem", textDecoration: "none" }}
        >
          Sou uma ONG → Acessar painel
        </Link>
      </div>
    </div>
  );
}
