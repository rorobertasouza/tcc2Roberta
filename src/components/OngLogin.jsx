import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles.css";

export default function OngLogin() {
  const [form, setForm]     = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro]     = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res  = await fetch("http://localhost/find-animal-friend-react/api/onglogin.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("ong", JSON.stringify(data.ong));
        navigate("/dashboard");
      } else {
        setErro(data.message || "Email ou senha inválidos.");
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <h1 className="auth-logo">🐾 Find Animal Friend</h1>
      <p className="auth-tagline">Painel exclusivo para ONGs</p>

      <div className="auth-card">
        <h2>Login da ONG</h2>

        {erro && (
          <div style={{
            background: "#fff0f3", border: "1px solid rgba(254,60,114,.3)",
            borderRadius: "10px", padding: "10px 14px",
            color: "var(--brand-primary)", fontSize: "0.88rem",
            fontWeight: 600, marginBottom: "14px",
          }}>
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="ong-email">Email</label>
            <input
              id="ong-email"
              type="email"
              name="email"
              value={form.email}
              placeholder="contato@ong.org"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="ong-senha">Senha</label>
            <input
              id="ong-senha"
              type="password"
              name="senha"
              value={form.senha}
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>

      <div className="auth-footer" style={{ marginTop: "16px" }}>
        <span>Ainda sem conta? </span>
        <Link to="/ong-register" style={{ color: "white", fontWeight: 700 }}>
          Cadastrar ONG
        </Link>
      </div>

      <div className="auth-footer" style={{ marginTop: "10px" }}>
        <Link to="/" style={{ color: "rgba(255,255,255,.6)", fontSize: "0.82rem", textDecoration: "none" }}>
          ← Voltar para o app
        </Link>
      </div>
    </div>
  );
}
