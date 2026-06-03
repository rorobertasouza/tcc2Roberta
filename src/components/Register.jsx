import React, { useState } from "react";
import { API_BASE } from "../config.js";
import "../styles.css";

export default function Register({ onBack }) {
  const [step, setStep] = useState(1); // Steps: 1=conta, 2=estilo, 3=preferencias
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

  const setField = (name, value) =>
    setForm(f => ({ ...f, [name]: f[name] === value ? "" : value }));

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    fetch(`${API_BASE}/register.php`, {
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

  const canGoStep2 = form.name && form.email && form.password;
  const canGoStep3 = form.residencia && form.espaco && form.tempo;

  return (
    <div className="reg-screen">
      <div className="reg-container">
        {/* Header */}
        <div className="reg-header">
          <h1>🐾 Criar Conta</h1>
          <p>Encontre seu companheiro ideal</p>
        </div>

        {/* Progress steps */}
        <div className="reg-progress">
          {[1, 2, 3].map(s => (
            <div key={s} className={`reg-step-dot ${step >= s ? "active" : ""} ${step === s ? "current" : ""}`}>
              {s}
            </div>
          ))}
          <div className="reg-progress-line">
            <div className="reg-progress-fill" style={{ width: `${((step - 1) / 2) * 100}%` }} />
          </div>
        </div>

        {/* Error */}
        {error && <div className="reg-error">{error}</div>}

        <form onSubmit={handleRegister}>

          {/* ── Step 1: Conta ── */}
          {step === 1 && (
            <div className="reg-step" key="step1">
              <h2 className="reg-step-title">👤 Seus Dados</h2>

              <div className="reg-field">
                <label>Nome completo</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="reg-input"
                  required
                />
              </div>

              <div className="reg-field">
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="reg-input"
                  required
                />
              </div>

              <div className="reg-field">
                <label>Senha</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="reg-input"
                  required
                />
              </div>

              <button
                type="button"
                className="reg-next-btn"
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
              >
                Continuar →
              </button>
            </div>
          )}

          {/* ── Step 2: Estilo de vida ── */}
          {step === 2 && (
            <div className="reg-step" key="step2">
              <h2 className="reg-step-title">🏠 Seu Estilo de Vida</h2>

              <div className="reg-field">
                <label>Tipo de residência</label>
                <div className="reg-pills">
                  {["Casa", "Apartamento", "Sítio/Chácara", "Outro"].map(v => (
                    <button key={v} type="button" className={`reg-pill ${form.residencia === v ? "active" : ""}`} onClick={() => setField("residencia", v)}>
                      {v === "Casa" && "🏡 "}{v === "Apartamento" && "🏢 "}{v === "Sítio/Chácara" && "🌾 "}{v === "Outro" && "📍 "}{v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Espaço disponível</label>
                <div className="reg-pills">
                  {["Pequeno", "Médio", "Grande", "Com quintal"].map(v => (
                    <button key={v} type="button" className={`reg-pill ${form.espaco === v ? "active" : ""}`} onClick={() => setField("espaco", v)}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Tempo livre para o pet</label>
                <div className="reg-pills col">
                  {[
                    { val: "Pouco", label: "⏰ Pouco — trabalho o dia todo" },
                    { val: "Moderado", label: "🕐 Moderado — meio período fora" },
                    { val: "Bastante", label: "💻 Bastante — home office" },
                    { val: "Integral", label: "🏠 Integral — sempre em casa" },
                  ].map(opt => (
                    <button key={opt.val} type="button" className={`reg-pill full ${form.tempo === opt.val ? "active" : ""}`} onClick={() => setField("tempo", opt.val)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Experiência com pets</label>
                <div className="reg-pills">
                  {["Nenhuma", "Pouca", "Moderada", "Muita"].map(v => (
                    <button key={v} type="button" className={`reg-pill ${form.experiencia === v ? "active" : ""}`} onClick={() => setField("experiencia", v)}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-nav-row">
                <button type="button" className="reg-back-btn" onClick={() => setStep(1)}>← Voltar</button>
                <button type="button" className="reg-next-btn" disabled={!canGoStep3} onClick={() => setStep(3)}>
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Preferências ── */}
          {step === 3 && (
            <div className="reg-step" key="step3">
              <h2 className="reg-step-title">🐾 Preferências de Pet</h2>
              <p className="reg-step-hint">Toque para selecionar (opcional)</p>

              <div className="reg-field">
                <label>Espécie</label>
                <div className="reg-pills">
                  {["Cachorro", "Gato", "Qualquer"].map(v => (
                    <button key={v} type="button" className={`reg-pill ${form.preferencia_especie === v ? "active" : ""}`} onClick={() => setField("preferencia_especie", v)}>
                      {v === "Cachorro" && "🐕 "}{v === "Gato" && "🐈 "}{v === "Qualquer" && "🐾 "}{v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Porte</label>
                <div className="reg-pills">
                  {[
                    { val: "P", label: "🐕 Pequeno" },
                    { val: "M", label: "🐕‍🦺 Médio" },
                    { val: "G", label: "🦮 Grande" },
                  ].map(opt => (
                    <button key={opt.val} type="button" className={`reg-pill ${form.preferencia_porte === opt.val ? "active" : ""}`} onClick={() => setField("preferencia_porte", opt.val)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Faixa etária</label>
                <div className="reg-pills">
                  {[
                    { val: "Filhote", label: "🍼 Filhote" },
                    { val: "Jovem", label: "🐶 Jovem" },
                    { val: "Adulto", label: "🐕 Adulto" },
                    { val: "Idoso", label: "🧓 Idoso" },
                  ].map(opt => (
                    <button key={opt.val} type="button" className={`reg-pill ${form.preferencia_idade === opt.val ? "active" : ""}`} onClick={() => setField("preferencia_idade", opt.val)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Sexo</label>
                <div className="reg-pills">
                  {[
                    { val: "Macho", label: "♂️ Macho" },
                    { val: "Fêmea", label: "♀️ Fêmea" },
                  ].map(opt => (
                    <button key={opt.val} type="button" className={`reg-pill ${form.preferencia_sexo === opt.val ? "active" : ""}`} onClick={() => setField("preferencia_sexo", opt.val)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-field">
                <label>Aceita necessidades especiais?</label>
                <div className="reg-pills">
                  {["Sim", "Não", "Depende"].map(v => (
                    <button key={v} type="button" className={`reg-pill ${form.aceita_especial === v ? "active" : ""}`} onClick={() => setField("aceita_especial", v)}>
                      {v === "Sim" && "💚 "}{v === "Não" && "❌ "}{v === "Depende" && "🤔 "}{v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="reg-nav-row">
                <button type="button" className="reg-back-btn" onClick={() => setStep(2)}>← Voltar</button>
                <button type="submit" className="reg-submit" disabled={loading}>
                  {loading ? "⏳ Criando..." : "🐾 Criar Conta"}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="reg-footer">
          <span>Já tem conta? </span>
          <button onClick={onBack}>Entrar</button>
        </div>
      </div>
    </div>
  );
}
