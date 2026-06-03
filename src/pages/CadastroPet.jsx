import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config.js";
import "./CadastroPet.css";
import "../styles.css";

export default function CadastroPet() {
  const navigate = useNavigate();
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [geoLoading, setGeoLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "", descricao: "", foto: "", idade: "",
    especie: "", local: "", porte: "", sexo: "",
    vacinado: "nao", castrado: "nao", contato: "",
    latitude: "", longitude: "",
  });

  useEffect(() => {
    const ongSalva = localStorage.getItem("ong");
    if (ongSalva) {
      setOng(JSON.parse(ongSalva));
    } else {
      navigate("/ong-login");
    }
  }, [navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("ong_id", ong?.id ?? 0);

    try {
      const res = await fetch(
        `${API_BASE}/cadastrarpet.php`,
        { method: "POST", body: fd }
      );
      const data = await res.json();

      if (data.success) {
        setMensagem({ texto: "✅ Pet cadastrado com sucesso!", tipo: "sucesso" });
        setForm({
          nome: "", descricao: "", foto: "", idade: "",
          especie: "", local: "", porte: "", sexo: "",
          vacinado: "nao", castrado: "nao", contato: "",
          latitude: "", longitude: "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMensagem({ texto: data.message || "Erro ao cadastrar pet.", tipo: "erro" });
      }
    } catch {
      setMensagem({ texto: "Erro de conexão com o servidor.", tipo: "erro" });
    } finally {
      setLoading(false);
    }
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      setMensagem({ texto: "Geolocalização não suportada", tipo: "erro" });
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(8),
          longitude: pos.coords.longitude.toFixed(8),
        }));
        setGeoLoading(false);
        setMensagem({ texto: "📍 Localização obtida!", tipo: "sucesso" });
      },
      (err) => {
        setGeoLoading(false);
        setMensagem({ texto: "Erro: " + err.message, tipo: "erro" });
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("ong");
    navigate("/ong-login");
  };

  // Toggle helpers for pill selectors
  const selectPorte = (val) => setForm(f => ({ ...f, porte: val }));
  const selectSexo = (val) => setForm(f => ({ ...f, sexo: val }));
  const toggleVacinado = () => setForm(f => ({ ...f, vacinado: f.vacinado === "sim" ? "nao" : "sim" }));
  const toggleCastrado = () => setForm(f => ({ ...f, castrado: f.castrado === "sim" ? "nao" : "sim" }));

  return (
    <div className="cp-page">
      {/* ── Top bar ── */}
      <header className="cp-topbar">
        <div className="cp-topbar-logo">🐾 Find Animal Friend</div>
        <div className="cp-topbar-right">
          {ong && <span className="cp-ong-badge">🏢 {ong.nome}</span>}
          <button className="cp-logout-btn" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="cp-content">
        <div className="cp-header">
          <h1>Cadastrar Pet</h1>
          <p>Preencha os dados para disponibilizar o pet para adoção</p>
        </div>

        {/* Alert */}
        {mensagem.texto && (
          <div className={`cp-alert ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="cp-form">

          {/* ── Foto preview + URL ── */}
          <div className="cp-photo-section">
            <div className={`cp-photo-preview ${form.foto ? "has-image" : ""}`}>
              {form.foto ? (
                <img
                  src={form.foto}
                  alt="Preview"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div className="cp-photo-placeholder">
                  <span>📷</span>
                  <small>Cole a URL abaixo</small>
                </div>
              )}
            </div>
            <input
              name="foto"
              value={form.foto}
              onChange={handleChange}
              required
              placeholder="URL da foto do pet"
              className="cp-input"
            />
          </div>

          {/* ── Nome e Espécie ── */}
          <div className="cp-row">
            <div className="cp-field">
              <label>Nome *</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                placeholder="Ex: Luna"
                className="cp-input"
              />
            </div>
            <div className="cp-field">
              <label>Espécie / Raça *</label>
              <input
                name="especie"
                value={form.especie}
                onChange={handleChange}
                required
                placeholder="Ex: Labrador, SRD"
                className="cp-input"
              />
            </div>
          </div>

          {/* ── Idade ── */}
          <div className="cp-field">
            <label>Idade (anos) *</label>
            <input
              name="idade"
              type="number"
              min="0"
              value={form.idade}
              onChange={handleChange}
              required
              placeholder="Ex: 2"
              className="cp-input"
            />
          </div>

          {/* ── Porte (pill selector) ── */}
          <div className="cp-field">
            <label>Porte *</label>
            <div className="cp-pills">
              {[
                { val: "pequeno", icon: "🐕", label: "Pequeno" },
                { val: "medio",   icon: "🐕‍🦺", label: "Médio" },
                { val: "grande",  icon: "🦮", label: "Grande" },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  className={`cp-pill ${form.porte === opt.val ? "active" : ""}`}
                  onClick={() => selectPorte(opt.val)}
                >
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sexo (pill selector) ── */}
          <div className="cp-field">
            <label>Sexo *</label>
            <div className="cp-pills">
              <button
                type="button"
                className={`cp-pill ${form.sexo === "macho" ? "active" : ""}`}
                onClick={() => selectSexo("macho")}
              >
                ♂️ Macho
              </button>
              <button
                type="button"
                className={`cp-pill ${form.sexo === "femea" ? "active" : ""}`}
                onClick={() => selectSexo("femea")}
              >
                ♀️ Fêmea
              </button>
            </div>
          </div>

          {/* ── Toggles: Vacinado / Castrado ── */}
          <div className="cp-toggles">
            <button
              type="button"
              className={`cp-toggle ${form.vacinado === "sim" ? "active" : ""}`}
              onClick={toggleVacinado}
            >
              <span className="cp-toggle-icon">💉</span>
              <span>Vacinado</span>
              <span className="cp-toggle-state">{form.vacinado === "sim" ? "Sim" : "Não"}</span>
            </button>
            <button
              type="button"
              className={`cp-toggle ${form.castrado === "sim" ? "active" : ""}`}
              onClick={toggleCastrado}
            >
              <span className="cp-toggle-icon">✂️</span>
              <span>Castrado</span>
              <span className="cp-toggle-state">{form.castrado === "sim" ? "Sim" : "Não"}</span>
            </button>
          </div>

          {/* ── Localização ── */}
          <div className="cp-field">
            <label>Localização *</label>
            <input
              name="local"
              value={form.local}
              onChange={handleChange}
              required
              placeholder="Ex: São Paulo - SP"
              className="cp-input"
            />
          </div>

          <div className="cp-row">
            <div className="cp-field">
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                className="cp-input cp-input-small"
              />
            </div>
            <div className="cp-field">
              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                className="cp-input cp-input-small"
              />
            </div>
          </div>
          <button
            type="button"
            className="cp-geo-btn"
            disabled={geoLoading}
            onClick={handleGeo}
          >
            {geoLoading ? "⏳ Obtendo..." : "📍 Usar minha localização"}
          </button>

          {/* ── WhatsApp ── */}
          <div className="cp-field">
            <label>WhatsApp para contato *</label>
            <input
              name="contato"
              value={form.contato}
              onChange={handleChange}
              required
              placeholder="Ex: 11999998888"
              className="cp-input"
            />
          </div>

          {/* ── Descrição ── */}
          <div className="cp-field">
            <label>Sobre o pet *</label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              required
              placeholder="Personalidade, hábitos, necessidades especiais..."
              className="cp-textarea"
              rows={4}
            />
          </div>

          {/* ── Submit ── */}
          <button type="submit" className="cp-submit" disabled={loading}>
            {loading ? "⏳ Cadastrando..." : "🐾 Cadastrar Pet"}
          </button>
        </form>
      </main>
    </div>
  );
}
