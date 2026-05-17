import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CadastroPet.css";
import "../styles.css";

export default function CadastroPet() {
  const navigate = useNavigate();
  const [ong, setOng] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState({ texto: "", tipo: "" });

  const [form, setForm] = useState({
    nome: "", descricao: "", foto: "", idade: "",
    especie: "", local: "", porte: "", sexo: "",
    vacinado: "nao", castrado: "nao", contato: "",
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
        "http://localhost/find-animal-friend-react/api/cadastrarpet.php",
        { method: "POST", body: fd }
      );
      const data = await res.json();

      if (data.success) {
        setMensagem({ texto: "✅ Pet cadastrado com sucesso! Já está disponível para adoção.", tipo: "sucesso" });
        setForm({
          nome: "", descricao: "", foto: "", idade: "",
          especie: "", local: "", porte: "", sexo: "",
          vacinado: "nao", castrado: "nao", contato: "",
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

  const handleLogout = () => {
    localStorage.removeItem("ong");
    navigate("/ong-login");
  };

  return (
    <div className="ong-dashboard">
      {/* ── Top bar ── */}
      <header className="ong-topbar">
        <div className="ong-topbar-logo">
          🐾 Find Animal Friend
        </div>
        <div className="ong-topbar-right">
          {ong && (
            <span className="ong-badge">🏢 {ong.nome}</span>
          )}
          <button className="ong-logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="ong-content">

        {/* Alert */}
        {mensagem.texto && (
          <div className={`ong-alert ${mensagem.tipo}`}>
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Seção: Dados principais */}
          <div className="ong-section">
            <div className="ong-section-header">
              🐾 Dados do Pet
            </div>
            <div className="ong-form-body">
              <div className="ong-row">
                <div className="ong-field">
                  <label htmlFor="pet-nome">Nome *</label>
                  <input
                    id="pet-nome"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                    placeholder="Nome do pet"
                  />
                </div>
                <div className="ong-field">
                  <label htmlFor="pet-especie">Espécie / Raça *</label>
                  <input
                    id="pet-especie"
                    name="especie"
                    value={form.especie}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Labrador, SRD, Persa..."
                  />
                </div>
              </div>

              <div className="ong-row">
                <div className="ong-field">
                  <label htmlFor="pet-idade">Idade (anos) *</label>
                  <input
                    id="pet-idade"
                    name="idade"
                    type="number"
                    min="0"
                    value={form.idade}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 2"
                  />
                </div>
                <div className="ong-field">
                  <label htmlFor="pet-porte">Porte *</label>
                  <select
                    id="pet-porte"
                    name="porte"
                    value={form.porte}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="pequeno">Pequeno</option>
                    <option value="medio">Médio</option>
                    <option value="grande">Grande</option>
                  </select>
                </div>
              </div>

              <div className="ong-row">
                <div className="ong-field">
                  <label htmlFor="pet-sexo">Sexo *</label>
                  <select
                    id="pet-sexo"
                    name="sexo"
                    value={form.sexo}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="macho">Macho</option>
                    <option value="femea">Fêmea</option>
                  </select>
                </div>
                <div className="ong-field">
                  <label htmlFor="pet-local">Localização *</label>
                  <input
                    id="pet-local"
                    name="local"
                    value={form.local}
                    onChange={handleChange}
                    required
                    placeholder="Ex: São Paulo - SP"
                  />
                </div>
              </div>

              <div className="ong-row">
                <div className="ong-field">
                  <label htmlFor="pet-vacinado">Vacinado?</label>
                  <select id="pet-vacinado" name="vacinado" value={form.vacinado} onChange={handleChange}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
                <div className="ong-field">
                  <label htmlFor="pet-castrado">Castrado?</label>
                  <select id="pet-castrado" name="castrado" value={form.castrado} onChange={handleChange}>
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Seção: Foto e contato */}
          <div className="ong-section">
            <div className="ong-section-header">
              📸 Foto e Contato
            </div>
            <div className="ong-form-body">
              <div className="ong-field">
                <label htmlFor="pet-foto">URL da Foto *</label>
                <input
                  id="pet-foto"
                  name="foto"
                  value={form.foto}
                  onChange={handleChange}
                  required
                  placeholder="https://exemplo.com/foto-do-pet.jpg"
                />
              </div>

              {form.foto && (
                <div style={{
                  width: "100%", height: "180px", borderRadius: "var(--radius-md)",
                  overflow: "hidden", background: "var(--surface-soft)",
                  border: "1px solid var(--border)",
                }}>
                  <img
                    src={form.foto}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}

              <div className="ong-field">
                <label htmlFor="pet-contato">WhatsApp para contato *</label>
                <input
                  id="pet-contato"
                  name="contato"
                  value={form.contato}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 11999998888"
                />
              </div>
            </div>
          </div>

          {/* Seção: Descrição */}
          <div className="ong-section">
            <div className="ong-section-header">
              📝 Descrição
            </div>
            <div className="ong-form-body">
              <div className="ong-field">
                <label htmlFor="pet-descricao">Conte sobre o pet *</label>
                <textarea
                  id="pet-descricao"
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  required
                  placeholder="Personalidade, hábitos, necessidades especiais, histórico..."
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="ong-submit-bar">
            <button type="submit" className="ong-submit-btn" disabled={loading}>
              {loading ? "Cadastrando..." : "🐾 Cadastrar Pet para Adoção"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
