import React, { useState } from "react";
import "../styles.css";

export default function Register({ onBack }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    residencia: "", espaco: "", tempo: "", experiencia: "",
    preferencia_especie: "", preferencia_porte: "",
    preferencia_idade: "", preferencia_sexo: "", aceita_especial: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    fetch("http://localhost/find-animal-friend-react/api/register.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then((text) => {
        const data = JSON.parse(text);
        if (data.success) {
          onBack();
        } else {
          setError(data.message || "Erro ao cadastrar.");
        }
      })
      .catch(() => setError("Erro de conexão."))
      .finally(() => setLoading(false));
  };

  const Field = ({ name, label, type = "text", placeholder }) => (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
      />
    </div>
  );

  const Select = ({ name, label, children }) => (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>
      <select
        id={name}
        name={name}
        value={form[name]}
        onChange={handleChange}
        style={{
          width: "100%", padding: "13px 16px",
          border: "2px solid var(--border)", borderRadius: "var(--radius-md)",
          fontSize: "0.95rem", fontFamily: "inherit", outline: "none",
          background: "var(--surface-soft)", color: "var(--text-primary)",
          appearance: "none",
        }}
      >
        {children}
      </select>
    </div>
  );

  return (
    <div className="auth-screen" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <h1 className="auth-logo">🐾 Criar Conta</h1>
      <p className="auth-tagline">Preencha seu perfil para encontrar o pet ideal</p>

      <div className="auth-card" style={{ maxWidth: "420px", overflowY: "auto", maxHeight: "80vh" }}>
        <h2>Cadastro</h2>

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

        <form onSubmit={handleRegister}>
          <Field name="name"     label="Nome completo"  placeholder="Seu nome" />
          <Field name="email"    label="Email"           type="email" placeholder="seu@email.com" />
          <Field name="password" label="Senha"           type="password" placeholder="••••••••" />

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px" }}>
            🏠 Seu estilo de vida
          </p>

          <Select name="residencia" label="Tipo de residência">
            <option value="">Selecione...</option>
            <option value="Casa">Casa</option>
            <option value="Apartamento">Apartamento</option>
            <option value="Sítio/Chácara">Sítio/Chácara</option>
            <option value="Outro">Outro</option>
          </Select>

          <Select name="espaco" label="Espaço disponível">
            <option value="">Selecione...</option>
            <option value="Pequeno">Pequeno</option>
            <option value="Médio">Médio</option>
            <option value="Grande">Grande</option>
            <option value="Com quintal">Com quintal</option>
          </Select>

          <Select name="tempo" label="Tempo livre para o pet">
            <option value="">Selecione...</option>
            <option value="Pouco">Pouco (trabalho o dia todo)</option>
            <option value="Moderado">Moderado (meio período fora)</option>
            <option value="Bastante">Bastante (home office)</option>
            <option value="Integral">Integral (estou sempre em casa)</option>
          </Select>

          <Select name="experiencia" label="Experiência com pets">
            <option value="">Selecione...</option>
            <option value="Nenhuma">Nenhuma (primeiro pet)</option>
            <option value="Pouca">Pouca</option>
            <option value="Moderada">Moderada</option>
            <option value="Muita">Muita</option>
          </Select>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "12px" }}>
            🐾 Preferências de pet
          </p>

          <Select name="preferencia_especie" label="Espécie preferida">
            <option value="">Qualquer</option>
            <option value="Vira-lata">Vira-lata</option>
            <option value="Labrador">Labrador</option>
            <option value="Poodle">Poodle</option>
            <option value="Golden Retriever">Golden Retriever</option>
            <option value="Gato">Gato</option>
            <option value="Gato Vira-lata">Gato Vira-lata</option>
          </Select>

          <Select name="preferencia_porte" label="Porte preferido">
            <option value="">Qualquer</option>
            <option value="P">Pequeno (P)</option>
            <option value="M">Médio (M)</option>
            <option value="G">Grande (G)</option>
          </Select>

          <Select name="preferencia_idade" label="Faixa etária">
            <option value="">Qualquer</option>
            <option value="Filhote">Filhote (0–1 ano)</option>
            <option value="Jovem">Jovem (1–3 anos)</option>
            <option value="Adulto">Adulto (3–7 anos)</option>
            <option value="Idoso">Idoso (7+ anos)</option>
          </Select>

          <Select name="preferencia_sexo" label="Sexo">
            <option value="">Qualquer</option>
            <option value="Macho">Macho</option>
            <option value="Fêmea">Fêmea</option>
          </Select>

          <Select name="aceita_especial" label="Aceita necessidades especiais?">
            <option value="">Selecione...</option>
            <option value="Sim">Sim</option>
            <option value="Não">Não</option>
            <option value="Depende">Depende do caso</option>
          </Select>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: "16px" }}>
            {loading ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>
      </div>

      <div className="auth-footer" style={{ marginTop: "16px" }}>
        <span>Já tem conta? </span>
        <button onClick={onBack}>Entrar</button>
      </div>
    </div>
  );
}
