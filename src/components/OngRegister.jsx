import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config.js";
import "../styles.css";

export default function OngRegister() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ nome: "", email: "", senha: "", contato: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro]     = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      const res  = await fetch(`${API_BASE}/ongregister.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        navigate("/ong-login");
      } else {
        setErro(data.message || "Erro ao cadastrar.");
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen" style={{ paddingTop: "32px", paddingBottom: "32px" }}>
      <h1 className="auth-logo">🐾 Find Animal Friend</h1>
      <p className="auth-tagline">Cadastre sua ONG e comece a conectar pets a famílias</p>

      <div className="auth-card">
        <h2>Cadastro de ONG</h2>

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
            <label htmlFor="ong-nome">Nome da ONG</label>
            <input
              id="ong-nome"
              name="nome"
              value={form.nome}
              placeholder="Ex: Patinhas Felizes"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="ong-reg-email">Email</label>
            <input
              id="ong-reg-email"
              name="email"
              type="email"
              value={form.email}
              placeholder="contato@ong.org"
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="ong-reg-senha">Senha</label>
            <input
              id="ong-reg-senha"
              name="senha"
              type="password"
              value={form.senha}
              placeholder="Mínimo 6 caracteres"
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="ong-contato">Telefone / WhatsApp</label>
            <input
              id="ong-contato"
              name="contato"
              value={form.contato}
              placeholder="Ex: 11999998888"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar ONG"}
          </button>
        </form>
      </div>

      <div className="auth-footer" style={{ marginTop: "16px" }}>
        <span>Já tem conta? </span>
        <Link to="/ong-login" style={{ fontWeight: 700 }}>
          Fazer login
        </Link>
      </div>

      <div className="auth-footer" style={{ marginTop: "10px" }}>
        <Link to="/" style={{ color: "var(--text-secondary)", fontSize: "0.82rem", textDecoration: "none" }}>
          ← Voltar para o app
        </Link>
      </div>
    </div>
  );
}
