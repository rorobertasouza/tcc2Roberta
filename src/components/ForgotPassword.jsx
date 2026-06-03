import React, { useState } from "react";
import { API_BASE } from "../config.js";
import "../styles.css";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: verify email, 2: reset password, 3: success screen
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/reset_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action: "check" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStep(2);
        } else {
          setError(data.message || "Email não cadastrado.");
        }
      })
      .catch(() => setError("Erro ao conectar ao servidor."))
      .finally(() => setLoading(false));
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/reset_password.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, action: "reset" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess("Senha redefinida com sucesso! Você já pode entrar.");
          setStep(3);
        } else {
          setError(data.message || "Erro ao redefinir a senha.");
        }
      })
      .catch(() => setError("Erro ao conectar ao servidor."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-screen">
      <h1 className="auth-logo">🐾 Find Animal Friend</h1>
      <p className="auth-tagline">Recupere o acesso à sua conta</p>

      <div className="auth-card">
        <h2>Recuperar Senha</h2>

        {error && (
          <div style={{
            background: "#fff0f3", border: "1px solid rgba(254,60,114,.3)",
            borderRadius: "10px", padding: "10px 14px",
            color: "var(--brand-primary)", fontSize: "0.88rem",
            fontWeight: 600, marginBottom: "14px",
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#eefaf3", border: "1px solid rgba(46,204,113,.3)",
            borderRadius: "10px", padding: "10px 14px",
            color: "#2ecc71", fontSize: "0.88rem",
            fontWeight: 600, marginBottom: "14px",
          }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleVerifyEmail}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.4" }}>
              Insira o email cadastrado para redefinir sua senha.
            </p>
            <div className="auth-field">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.4" }}>
              Email encontrado! Como estamos em ambiente de testes, você pode definir a nova senha diretamente abaixo.
            </p>
            <div className="auth-field">
              <label htmlFor="reset-new-password">Nova Senha</label>
              <input
                id="reset-new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="reset-confirm-password">Confirmar Nova Senha</label>
              <input
                id="reset-confirm-password"
                type="password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </form>
        )}

        {step === 3 && (
          <button onClick={onBack} className="btn-primary">
            Ir para o Login
          </button>
        )}
      </div>

      <div className="auth-footer" style={{ marginTop: "20px" }}>
        <button onClick={onBack} style={{ textDecoration: "underline" }}>
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
