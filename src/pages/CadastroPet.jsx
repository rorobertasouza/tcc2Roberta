import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config.js";
import { useAuth } from "../context/AuthContext.tsx";
import "./CadastroPet.css";
import "../styles.css";

export default function CadastroPet() {
  const { logoutOng } = useAuth();
  const navigate = useNavigate();
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });
  const [geoLoading, setGeoLoading] = useState(false);

  // Upload state
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    nome: "", descricao: "", foto: "", idade: "",
    especie: "", local: "", porte: "", sexo: "",
    vacinado: "nao", castrado: "nao", contato: "",
    latitude: "", longitude: "",
    origem: "", motivo_adocao: "",
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

  // ── File handling ──
  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setMensagem({ texto: "Formato não permitido. Use JPG, PNG, WebP ou GIF.", tipo: "erro" });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMensagem({ texto: "Arquivo muito grande. Máximo: 5 MB.", tipo: "erro" });
      return;
    }

    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setMensagem({ texto: "", tipo: "" });
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  };

  const removePhoto = () => {
    setFotoFile(null);
    setFotoPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Upload image then submit pet ──
  const uploadImage = async () => {
    if (!fotoFile) return null;

    const fd = new FormData();
    fd.append("foto", fotoFile);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            resolve(data.path);
          } else {
            reject(new Error(data.message || "Erro no upload"));
          }
        } catch {
          reject(new Error("Resposta inválida do servidor"));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Erro de conexão")));
      xhr.open("POST", `${API_BASE}/upload.php`);
      xhr.send(fd);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem({ texto: "", tipo: "" });
    setUploadProgress(0);

    try {
      // Step 1: Upload the image
      let fotoPath = form.foto; // fallback to URL if typed manually

      if (fotoFile) {
        setMensagem({ texto: "Enviando foto...", tipo: "info" });
        fotoPath = await uploadImage();
      }

      if (!fotoPath && !fotoFile) {
        setMensagem({ texto: "Selecione uma foto para o pet.", tipo: "erro" });
        setLoading(false);
        return;
      }

      // Step 2: Submit pet data
      setMensagem({ texto: "Cadastrando pet...", tipo: "info" });
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== "foto") fd.append(k, v);
      });
      fd.append("foto", fotoPath);
      fd.append("ong_id", ong?.id ?? 0);

      const res = await fetch(
        `${API_BASE}/cadastrarpet.php`,
        { method: "POST", body: fd }
      );
      const data = await res.json();

      if (data.success) {
        setMensagem({ texto: "Pet cadastrado com sucesso!", tipo: "sucesso" });
        setForm({
          nome: "", descricao: "", foto: "", idade: "",
          especie: "", local: "", porte: "", sexo: "",
          vacinado: "nao", castrado: "nao", contato: "",
          latitude: "", longitude: "",
          origem: "", motivo_adocao: "",
        });
        removePhoto();
        setUploadProgress(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setMensagem({ texto: data.message || "Erro ao cadastrar pet.", tipo: "erro" });
      }
    } catch (err) {
      setMensagem({ texto: err.message || "Erro de conexão com o servidor.", tipo: "erro" });
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
        setMensagem({ texto: "Localização obtida!", tipo: "sucesso" });
      },
      (err) => {
        setGeoLoading(false);
        setMensagem({ texto: "Erro: " + err.message, tipo: "erro" });
      }
    );
  };

  const handleLogout = () => {
    logoutOng();
    navigate("/ong-login");
  };

  // Toggle helpers for pill selectors
  const selectPorte = (val) => setForm(f => ({ ...f, porte: val }));
  const selectSexo = (val) => setForm(f => ({ ...f, sexo: val }));
  const selectOrigem = (val) => setForm(f => ({ ...f, origem: f.origem === val ? "" : val }));
  const toggleVacinado = () => setForm(f => ({ ...f, vacinado: f.vacinado === "sim" ? "nao" : "sim" }));
  const toggleCastrado = () => setForm(f => ({ ...f, castrado: f.castrado === "sim" ? "nao" : "sim" }));

  return (
    <div className="cp-page">
      {/* ── Top bar ── */}
      <header className="cp-topbar">
        <div className="cp-topbar-logo">Find Animal Friend</div>
        <div className="cp-topbar-right">
          {ong && <span className="cp-ong-badge">{ong.nome}</span>}
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

          {/* ── Photo Upload Section ── */}
          <div className="cp-photo-section">
            <label className="cp-field-label">Foto do pet *</label>

            {/* Drop zone */}
            <div
              className={`cp-drop-zone ${isDragging ? "dragging" : ""} ${fotoPreview ? "has-image" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !fotoPreview && fileInputRef.current?.click()}
            >
              {fotoPreview ? (
                <div className="cp-preview-wrapper">
                  <img src={fotoPreview} alt="Preview do pet" />
                  <button
                    type="button"
                    className="cp-remove-photo"
                    onClick={(e) => { e.stopPropagation(); removePhoto(); }}
                    title="Remover foto"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                  <div className="cp-change-overlay" onClick={() => fileInputRef.current?.click()}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <span>Trocar foto</span>
                  </div>
                </div>
              ) : (
                <div className="cp-upload-placeholder">
                  <div className="cp-upload-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <span className="cp-upload-text">Toque para selecionar uma foto</span>
                  <span className="cp-upload-hint">ou arraste e solte aqui</span>
                  <span className="cp-upload-formats">JPG, PNG, WebP ou GIF — Máx. 5 MB</span>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileInput}
              style={{ display: "none" }}
              id="pet-photo-input"
            />

            {/* Upload progress bar */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="cp-progress-bar">
                <div
                  className="cp-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="cp-progress-text">{uploadProgress}%</span>
              </div>
            )}
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
                { val: "pequeno", label: "Pequeno" },
                { val: "medio",   label: "Médio" },
                { val: "grande",  label: "Grande" },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  className={`cp-pill ${form.porte === opt.val ? "active" : ""}`}
                  onClick={() => selectPorte(opt.val)}
                >
                  {opt.label}
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
                Macho
              </button>
              <button
                type="button"
                className={`cp-pill ${form.sexo === "femea" ? "active" : ""}`}
                onClick={() => selectSexo("femea")}
              >
                Fêmea
              </button>
            </div>
          </div>

          {/* ── Origem do pet ── */}
          <div className="cp-field">
            <label>Origem do pet</label>
            <div className="cp-pills">
              {[
                "Resgate de rua",
                "Abandono",
                "Maus-tratos",
                "Ninhada",
                "Devolução",
                "Outro",
              ].map(val => (
                <button
                  key={val}
                  type="button"
                  className={`cp-pill ${form.origem === val ? "active" : ""}`}
                  onClick={() => selectOrigem(val)}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* ── Motivo para adoção ── */}
          <div className="cp-field">
            <label>Motivo para adoção</label>
            <textarea
              name="motivo_adocao"
              value={form.motivo_adocao}
              onChange={handleChange}
              placeholder="Ex: Encontrado na rua em condições precárias, precisa de um lar amoroso..."
              className="cp-textarea"
              rows={3}
            />
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
              placeholder="Ex: Porto Alegre - RS"
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
            {geoLoading ? "Obtendo..." : "Usar minha localização"}
          </button>

          {/* ── WhatsApp ── */}
          <div className="cp-field">
            <label>WhatsApp para contato *</label>
            <input
              name="contato"
              value={form.contato}
              onChange={handleChange}
              required
              placeholder="Ex: 51999998888"
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
            {loading ? "Cadastrando..." : "Cadastrar Pet"}
          </button>
        </form>
      </main>
    </div>
  );
}
