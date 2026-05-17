import React, { useState, useEffect } from "react";
import AppShell from "./AppShell.jsx";
import "./Profile.css";

const API_BASE = "http://localhost/find-animal-friend-react/api";

export default function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState({
    nome: storedUser.nome || "",
    email: storedUser.email || "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const userId = storedUser.id;
    const url = userId
      ? `${API_BASE}/perfil.php?user_id=${userId}`
      : `${API_BASE}/perfil.php`;

    fetch(url, { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setProfile(data.data);
        else showToast("Não foi possível carregar o perfil", "error");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.keys(profile).forEach((k) => formData.append(k, profile[k]));
    if (storedUser.id) formData.append("user_id", storedUser.id);

    fetch(`${API_BASE}/perfil.php`, {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Perfil atualizado! ✅", "success");
          setIsEditing(false);
        } else {
          showToast(data.message || "Erro ao salvar", "error");
        }
        setSaving(false);
      })
      .catch(() => {
        showToast("Erro de conexão", "error");
        setSaving(false);
      });
  };

  const handleCancel = () => {
    setLoading(true);
    const userId = storedUser.id;
    const url = userId
      ? `${API_BASE}/perfil.php?user_id=${userId}`
      : `${API_BASE}/perfil.php`;
    fetch(url, { method: "GET", credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setProfile(data.data);
        setIsEditing(false);
        setLoading(false);
      })
      .catch(() => { setIsEditing(false); setLoading(false); });
  };

  /* ── Helpers ── */
  const initials = (profile.nome || "?").charAt(0).toUpperCase();

  const infoRows = [
    { icon: "✉️",  label: "Email",             value: profile.email       },
    { icon: "🏠",  label: "Tipo de residência", value: profile.residencia  },
    { icon: "📐",  label: "Espaço disponível",  value: profile.espaco      },
    { icon: "⏰",  label: "Tempo livre",         value: profile.tempo       },
    { icon: "🐾",  label: "Experiência",         value: profile.experiencia },
  ];

  const prefChips = [
    { icon: "🐕", label: profile.preferencia_especie || "Qualquer espécie" },
    { icon: "📏", label: profile.preferencia_porte   || "Qualquer porte"   },
    { icon: "🎂", label: profile.preferencia_idade   || "Qualquer idade"   },
    { icon: "⚧",  label: profile.preferencia_sexo    || "Qualquer sexo"    },
    ...(profile.aceita_especial
      ? [{ icon: "💙", label: `Especiais: ${profile.aceita_especial}` }]
      : []),
  ];

  /* ── Render ── */
  if (loading) {
    return (
      <AppShell title="Meu Perfil">
        <div className="spinner-global">
          <div className="ring" />
          <p>Carregando perfil...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Meu Perfil">
      {toast && (
        <div className={`profile-toast ${toast.type}`}>{toast.message}</div>
      )}

      <div className="profile-page">
        {/* ── Hero ── */}
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <h2 className="profile-name">{profile.nome || "Seu Nome"}</h2>
          {(profile.residencia || profile.espaco) && (
            <div className="profile-subtitle">
              {profile.residencia && <span>🏠 {profile.residencia}</span>}
              {profile.residencia && profile.espaco && (
                <span className="dot" />
              )}
              {profile.espaco && <span>📐 {profile.espaco}</span>}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="profile-body">
          {!isEditing ? (
            /* ===== VIEW MODE ===== */
            <>
              {/* Info card */}
              <div className="info-card">
                <div className="info-card-header">
                  <span className="icon">👤</span> Informações
                </div>
                <div className="info-rows">
                  {infoRows.map((row) => (
                    <div className="info-row" key={row.label}>
                      <span className="info-row-label">
                        <span className="row-icon">{row.icon}</span>
                        {row.label}
                      </span>
                      <span className="info-row-value">
                        {row.value || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferences card */}
              <div className="info-card">
                <div className="info-card-header">
                  <span className="icon">🐾</span> Preferências de Pet
                </div>
                <div className="pref-chips">
                  {prefChips.map((c) => (
                    <span className="pref-chip" key={c.label}>
                      <span className="chip-icon">{c.icon}</span>
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit button */}
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                ✏️ Editar Perfil
              </button>
            </>
          ) : (
            /* ===== EDIT MODE ===== */
            <form onSubmit={handleSave}>
              {/* Pessoais */}
              <div className="profile-form-wrap">
                <div className="form-section-header">
                  <span>👤</span> Informações Pessoais
                </div>
                <div className="profile-form-inner">
                  <div className="form-group">
                    <label htmlFor="nome">Nome</label>
                    <input id="nome" name="nome" type="text"
                      value={profile.nome || ""} onChange={handleChange}
                      placeholder="Seu nome completo" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email"
                      value={profile.email || ""} onChange={handleChange}
                      placeholder="seu@email.com" />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="residencia">Residência</label>
                      <select id="residencia" name="residencia"
                        value={profile.residencia || ""} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        <option value="Casa">Casa</option>
                        <option value="Apartamento">Apartamento</option>
                        <option value="Sítio/Chácara">Sítio/Chácara</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="espaco">Espaço</label>
                      <select id="espaco" name="espaco"
                        value={profile.espaco || ""} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        <option value="Pequeno">Pequeno</option>
                        <option value="Médio">Médio</option>
                        <option value="Grande">Grande</option>
                        <option value="Com quintal">Com quintal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="tempo">Tempo livre</label>
                      <select id="tempo" name="tempo"
                        value={profile.tempo || ""} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        <option value="Pouco">Pouco</option>
                        <option value="Moderado">Moderado</option>
                        <option value="Bastante">Bastante</option>
                        <option value="Integral">Integral</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="experiencia">Experiência</label>
                      <select id="experiencia" name="experiencia"
                        value={profile.experiencia || ""} onChange={handleChange}>
                        <option value="">Selecione...</option>
                        <option value="Nenhuma">Nenhuma</option>
                        <option value="Pouca">Pouca</option>
                        <option value="Moderada">Moderada</option>
                        <option value="Muita">Muita</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferências */}
              <div className="profile-form-wrap" style={{ marginTop: "12px" }}>
                <div className="form-section-header">
                  <span>🐾</span> Preferências de Pet
                </div>
                <div className="profile-form-inner">
                  <p className="pref-hint">
                    💡 Essas preferências definem quais pets aparecem nos cards para você.
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="preferencia_especie">Espécie</label>
                      <select id="preferencia_especie" name="preferencia_especie"
                        value={profile.preferencia_especie || ""} onChange={handleChange}>
                        <option value="">Qualquer</option>
                        <option value="Vira-lata">Vira-lata</option>
                        <option value="Labrador">Labrador</option>
                        <option value="Poodle">Poodle</option>
                        <option value="Bulldog">Bulldog</option>
                        <option value="Pastor Alemão">Pastor Alemão</option>
                        <option value="Golden Retriever">Golden Retriever</option>
                        <option value="Pitbull">Pitbull</option>
                        <option value="Shih Tzu">Shih Tzu</option>
                        <option value="Gato">Gato</option>
                        <option value="Gato Vira-lata">Gato Vira-lata</option>
                        <option value="Siamês">Siamês</option>
                        <option value="Persa">Persa</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="preferencia_porte">Porte</label>
                      <select id="preferencia_porte" name="preferencia_porte"
                        value={profile.preferencia_porte || ""} onChange={handleChange}>
                        <option value="">Qualquer</option>
                        <option value="P">Pequeno</option>
                        <option value="M">Médio</option>
                        <option value="G">Grande</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="preferencia_idade">Faixa etária</label>
                      <select id="preferencia_idade" name="preferencia_idade"
                        value={profile.preferencia_idade || ""} onChange={handleChange}>
                        <option value="">Qualquer</option>
                        <option value="Filhote">Filhote (0–1 ano)</option>
                        <option value="Jovem">Jovem (1–3 anos)</option>
                        <option value="Adulto">Adulto (3–7 anos)</option>
                        <option value="Idoso">Idoso (7+ anos)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="preferencia_sexo">Sexo</label>
                      <select id="preferencia_sexo" name="preferencia_sexo"
                        value={profile.preferencia_sexo || ""} onChange={handleChange}>
                        <option value="">Qualquer</option>
                        <option value="Macho">Macho</option>
                        <option value="Fêmea">Fêmea</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="aceita_especial">Necessidades especiais</label>
                    <select id="aceita_especial" name="aceita_especial"
                      value={profile.aceita_especial || ""} onChange={handleChange}>
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim, aceito</option>
                      <option value="Não">Não</option>
                      <option value="Depende">Depende do caso</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Salvando..." : "💾 Salvar"}
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancel}>
                    Cancelar
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
