import React, { useState, useEffect } from "react";
import AppShell from "./AppShell.jsx";
import { API_BASE } from "../config.js";
import "./PosAdocao.css";

// Checklist de cuidados iniciais (estático/didático)
const CHECKLIST_ITEMS = [
  { id: 1, icon: "🏠", text: "Preparar um espaço seguro e confortável para o pet" },
  { id: 2, icon: "🍽️", text: "Comprar ração adequada, comedouro e bebedouro" },
  { id: 3, icon: "💉", text: "Agendar consulta veterinária inicial e verificar vacinas" },
  { id: 4, icon: "🪪", text: "Providenciar identificação (coleira com plaquinha/microchip)" },
  { id: 5, icon: "🧸", text: "Ter brinquedos e itens de enriquecimento ambiental" },
  { id: 6, icon: "🚿", text: "Primeiro banho e higiene (verificar antipulgas)" },
  { id: 7, icon: "📋", text: "Definir rotina de alimentação, passeios e brincadeiras" },
  { id: 8, icon: "❤️", text: "Dar muito amor, paciência e tempo de adaptação!" },
];

const TIPO_ICONS = {
  nota: "📝",
  vacina: "💉",
  consulta: "🩺",
  marco: "🎉",
};

const TIPO_LABELS = {
  nota: "Nota",
  vacina: "Vacina",
  consulta: "Consulta",
  marco: "Marco",
};

// ── Dicas de cuidado baseadas em espécie e idade ──
const CARE_TIPS = {
  cachorro: {
    filhote: {
      alimentacao: [
        { title: "Ração para filhotes", text: "Use ração específica para filhotes (puppy). Eles precisam de mais calorias e nutrientes para crescer saudáveis. Alimente 3-4 vezes ao dia." },
        { title: "Água sempre fresca", text: "Filhotes se desidratam rápido! Troque a água pelo menos 2x ao dia e mantenha o bebedouro limpo." },
        { title: "Evite comida humana", text: "Chocolate, uva, cebola e alho são tóxicos para cães. Nunca ofereça restos de comida." },
      ],
      saude: [
        { title: "Vacinação V8/V10", text: "A partir de 45 dias, inicie o esquema vacinal. São 3 doses com intervalo de 21 dias. Não leve para passeios antes de completar." },
        { title: "Vermifugação", text: "Vermifugue a cada 15 dias até 3 meses, depois mensalmente até 6 meses. Consulte o veterinário para o produto ideal." },
        { title: "Antipulgas", text: "A partir de 2 meses já pode usar antipulgas. Escolha produtos específicos para filhotes." },
      ],
      comportamento: [
        { title: "Socialização precoce", text: "Entre 3-14 semanas é a janela de socialização. Exponha o filhote a pessoas, sons e objetos diferentes com calma e reforço positivo." },
        { title: "Mordidas de filhote", text: "Redirecione mordidas para brinquedos. Quando morder sua mão, solte um 'AI' agudo e pare a brincadeira por 10 segundos." },
        { title: "Xixi no lugar certo", text: "Leve ao local correto após acordar, comer e brincar. Recompense com petisco quando acertar. Nunca esfregue o focinho na sujeira." },
      ],
      higiene: [
        { title: "Primeiro banho", text: "Só após a 2ª dose de vacina (por volta de 3 meses). Use shampoo específico para filhotes e água morna." },
        { title: "Escovação dos dentes", text: "Acostume desde cedo! Use dedeira e pasta dental para cães. Isso previne tártaro e problemas na vida adulta." },
      ],
    },
    adulto: {
      alimentacao: [
        { title: "Quantidade adequada", text: "Siga a tabela da ração de acordo com o peso. Alimente 2x ao dia em horários fixos. Evite deixar ração à vontade." },
        { title: "Petiscos com moderação", text: "Petiscos não devem ultrapassar 10% da dieta diária. Use como recompensa no treino, não como hábito." },
        { title: "Peso ideal", text: "Passe a mão nas costelas — elas devem ser sentidas mas não visíveis. Obesidade causa problemas articulares e cardíacos." },
      ],
      saude: [
        { title: "Check-up anual", text: "Leve ao veterinário ao menos 1x por ano para exames de sangue, fezes e avaliação geral." },
        { title: "Vacina de reforço", text: "V8/V10 e antirrábica devem ser reforçadas anualmente. Mantenha a carteirinha atualizada." },
        { title: "Castração", text: "A castração previne tumores, infecções uterinas e comportamentos indesejados. Converse com o veterinário sobre o melhor momento." },
      ],
      comportamento: [
        { title: "Passeios diários", text: "Cães adultos precisam de 30-60 min de exercício diário. Passeios estimulam a mente e gastam energia." },
        { title: "Enriquecimento ambiental", text: "Brinquedos interativos, Kong recheado e tapete de lamber evitam tédio e ansiedade." },
        { title: "Comandos básicos", text: "Treino com reforço positivo (petiscos e carinho) funciona melhor que punição. Ensine: senta, deita, fica, vem." },
      ],
      higiene: [
        { title: "Banho quinzenal", text: "Banhos a cada 15 dias são suficientes. Banhos em excesso removem a oleosidade natural da pele." },
        { title: "Unhas e ouvidos", text: "Apare as unhas mensalmente. Limpe os ouvidos semanalmente com produto específico para evitar otite." },
        { title: "Escovação dos pelos", text: "Escove 2-3x por semana para remover pelos mortos e distribuir a oleosidade natural. Raças de pelo longo precisam de mais frequência." },
      ],
    },
    idoso: {
      alimentacao: [
        { title: "Ração sênior", text: "A partir de 7 anos (raças grandes 5 anos), mude para ração sênior. Tem menos calorias e mais condroitina para as articulações." },
        { title: "Suplementação", text: "Ômega 3, glucosamina e condroitina ajudam nas articulações. Sempre sob orientação veterinária." },
      ],
      saude: [
        { title: "Check-up semestral", text: "Cães idosos devem ir ao vet a cada 6 meses. Exames de sangue, urina e ultrassom detectam problemas precocemente." },
        { title: "Problemas comuns", text: "Fique atento a: dificuldade para levantar, perda de apetite, sede excessiva, tosse e nódulos na pele." },
        { title: "Conforto nas articulações", text: "Ofereça cama ortopédica, rampas para sofá/cama e evite pisos escorregadios. Passeios curtos e frequentes." },
      ],
      comportamento: [
        { title: "Paciência extra", text: "Cães idosos podem ficar mais lentos, dormir mais e ter perda de audição/visão. Adapte a rotina com carinho." },
        { title: "Estímulo mental", text: "Jogos simples de farejar petiscos escondidos mantêm a mente ativa e previnem disfunção cognitiva." },
      ],
      higiene: [
        { title: "Banho com cuidado", text: "Use água morna e seque bem. Cães idosos são mais sensíveis ao frio. Prefira banho a seco se for muito estressante." },
        { title: "Saúde dental", text: "Problemas dentários são muito comuns em idosos. Observe se come com dificuldade ou baba excessivamente." },
      ],
    },
  },
  gato: {
    filhote: {
      alimentacao: [
        { title: "Ração para filhotes", text: "Use ração específica para gatinhos (kitten) até 1 ano. Ofereça 3-4 porções pequenas ao dia." },
        { title: "Hidratação", text: "Gatos bebem pouca água naturalmente. Considere uma fonte de água corrente — eles adoram! Ração úmida também ajuda." },
      ],
      saude: [
        { title: "Vacina tríplice/quádrupla", text: "A partir de 60 dias, 3 doses com intervalo de 30 dias. Inclui proteção contra rinotraqueíte, calicivirose e panleucopenia." },
        { title: "Teste FIV/FeLV", text: "Antes de juntar com outros gatos, faça o teste de FIV (AIDS felina) e FeLV (leucemia felina). É essencial!" },
        { title: "Vermifugação", text: "Vermifugue com 30, 45 e 60 dias, depois a cada 3 meses. Produtos para gatos são diferentes dos de cães!" },
      ],
      comportamento: [
        { title: "Arranhador é essencial", text: "Gatos PRECISAM arranhar — é natural. Ofereça arranhadores verticais e horizontais. Passe erva-do-gato para atrair." },
        { title: "Caixa de areia", text: "Regra: 1 caixa por gato + 1 extra. Limpe diariamente. Coloque em local tranquilo, longe da comida." },
        { title: "Brincadeiras", text: "Gatinhos precisam de muito estímulo! Varinhas, bolinhas e brinquedos que simulam caça. 15-20 min, 2-3x ao dia." },
      ],
      higiene: [
        { title: "Gatos se limpam sozinhos", text: "Banho só em casos especiais. A maioria dos gatos não precisa de banho. Escove os pelos 1-2x por semana." },
        { title: "Limpeza dos olhos", text: "Filhotes podem ter secreção nos olhos. Limpe com gaze umedecida em soro fisiológico, sempre de dentro para fora." },
      ],
    },
    adulto: {
      alimentacao: [
        { title: "Ração premium", text: "Invista em ração de qualidade. Gatos são carnívoros estritos — precisam de proteína animal de qualidade." },
        { title: "Ração úmida", text: "Intercale ração seca e úmida. Sachês e patês aumentam a ingestão de água e previnem problemas renais." },
        { title: "Cuidado com obesidade", text: "Gatos de apartamento tendem a engordar. Controle a quantidade e incentive brincadeiras para gastar energia." },
      ],
      saude: [
        { title: "Problemas renais", text: "Doença renal é muito comum em gatos. Incentive a hidratação e faça exames de sangue anuais para monitorar." },
        { title: "Castração", text: "Gatos não castrados marcam território com urina e tentam fugir. A castração previne tumores e comportamentos indesejados." },
        { title: "Vacinas anuais", text: "Reforço anual da V3/V4 e antirrábica. Mesmo gatos de apartamento precisam — vírus podem entrar pela janela e sapatos." },
      ],
      comportamento: [
        { title: "Enriquecimento vertical", text: "Gatos amam altura! Prateleiras, nichos e árvores de gato são essenciais para o bem-estar em apartamento." },
        { title: "Janelas teladas", text: "NUNCA deixe janelas sem tela! A síndrome do gato voador é uma emergência comum. Tele TODAS as janelas e sacadas." },
        { title: "Rotina e previsibilidade", text: "Gatos amam rotina. Alimente nos mesmos horários, mantenha a caixa de areia no mesmo lugar." },
      ],
      higiene: [
        { title: "Escovação regular", text: "Gatos de pelo longo: escove diariamente. Pelo curto: 2-3x por semana. Previne bolas de pelo e hairballs." },
        { title: "Unhas", text: "Apare as pontas das unhas a cada 15 dias. Use cortador específico para gatos. Se não souber, peça ao vet demonstrar." },
      ],
    },
    idoso: {
      alimentacao: [
        { title: "Ração sênior", text: "A partir de 7-8 anos, mude para ração sênior. Fórmulas especiais para rins e articulações." },
        { title: "Muita água!", text: "Gatos idosos são ainda mais propensos a problemas renais. Fonte de água, sachês e até adicionar água à ração seca." },
      ],
      saude: [
        { title: "Check-up semestral", text: "Hemograma, bioquímico, urina e ultrassom. Gatos escondem dor — exames regulares detectam problemas cedo." },
        { title: "Hipertireoidismo", text: "Muito comum em gatos idosos. Sintomas: perda de peso mesmo comendo muito, hiperatividade e vômitos. Exame de T4 detecta." },
        { title: "Dor silenciosa", text: "Gatos não demonstram dor como cães. Observe: menos saltos, dormindo mais, não se limpando, isolamento." },
      ],
      comportamento: [
        { title: "Acessibilidade", text: "Coloque escadinhas para acesso a locais altos. Caixa de areia com borda baixa. Cama quentinha perto do chão." },
        { title: "Carinho e presença", text: "Gatos idosos ficam mais carentes. Reserve momentos de carinho e escovação tranquila." },
      ],
      higiene: [
        { title: "Ajuda na higiene", text: "Gatos idosos podem parar de se lamber. Escove diariamente e limpe áreas que ele não alcança." },
        { title: "Dentes", text: "Problemas dentários causam dor e perda de apetite. Se parou de comer ração seca, pode ser dor dental." },
      ],
    },
  },
};

const CARE_CATEGORIES = [
  { key: "alimentacao", icon: "🍽️", label: "Alimentação", color: "#f59e0b" },
  { key: "saude", icon: "💊", label: "Saúde", color: "#10b981" },
  { key: "comportamento", icon: "🧠", label: "Comportamento", color: "#8b5cf6" },
  { key: "higiene", icon: "🧼", label: "Higiene", color: "#3b82f6" },
];

// Detecta espécie a partir do campo breed/especie
function detectSpecies(breed) {
  if (!breed) return "cachorro";
  const b = breed.toLowerCase();
  const catKeywords = ["gato", "gata", "felino", "persa", "siamês", "siames", "angorá", "angora", "maine coon", "sphynx", "ragdoll", "bengal", "british", "srd gato", "srd felino"];
  if (catKeywords.some(k => b.includes(k))) return "gato";
  return "cachorro";
}

// Classifica faixa etária
function getAgeGroup(age, species) {
  const a = parseInt(age) || 0;
  if (species === "gato") {
    if (a <= 1) return "filhote";
    if (a >= 8) return "idoso";
    return "adulto";
  }
  if (a <= 1) return "filhote";
  if (a >= 7) return "idoso";
  return "adulto";
}

const AGE_GROUP_LABELS = { filhote: "Filhote", adulto: "Adulto", idoso: "Idoso" };
const SPECIES_LABELS = { cachorro: "🐕 Cão", gato: "🐈 Gato" };

export default function PosAdocao() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.id;

  const [adocoes, setAdocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdocao, setSelectedAdocao] = useState(null);
  const [diario, setDiario] = useState([]);
  const [diarioLoading, setDiarioLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedTipCategory, setExpandedTipCategory] = useState(null);
  const [expandedTipIndex, setExpandedTipIndex] = useState(null);

  // Checklist local (persiste em localStorage)
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem("posAdocao_checklist");
    return saved ? JSON.parse(saved) : {};
  });

  // Formulário nova entrada
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "nota",
  });

  useEffect(() => {
    fetchAdocoes();
  }, []);

  useEffect(() => {
    localStorage.setItem("posAdocao_checklist", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const fetchAdocoes = () => {
    fetch(`${API_BASE}/pos_adocao.php?user_id=${userId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAdocoes(data.adocoes);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchDiario = (adocaoId) => {
    setDiarioLoading(true);
    fetch(`${API_BASE}/pos_adocao.php?user_id=${userId}&adocao_id=${adocaoId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDiario(data.entradas);
        setDiarioLoading(false);
      })
      .catch(() => setDiarioLoading(false));
  };

  const handleSelectAdocao = (adocao) => {
    setSelectedAdocao(adocao);
    fetchDiario(adocao.adocao_id);
    setFormOpen(false);
  };

  const handleBack = () => {
    setSelectedAdocao(null);
    setDiario([]);
    setFormOpen(false);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleCheck = (adocaoId, itemId) => {
    const key = `${adocaoId}_${itemId}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitEntry = (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      showToast("Preencha o título", "error");
      return;
    }

    fetch(`${API_BASE}/pos_adocao.php`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        adocao_id: selectedAdocao.adocao_id,
        ...formData,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Registro adicionado! 📝");
          setFormData({ titulo: "", descricao: "", tipo: "nota" });
          setFormOpen(false);
          fetchDiario(selectedAdocao.adocao_id);
        } else {
          showToast(data.message || "Erro ao salvar", "error");
        }
      })
      .catch(() => showToast("Erro de conexão", "error"));
  };

  const handleDeleteEntry = (entradaId) => {
    fetch(`${API_BASE}/pos_adocao.php`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        entrada_id: entradaId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDiario((prev) => prev.filter((e) => e.id !== entradaId));
          showToast("Registro removido");
        }
      })
      .catch(() => showToast("Erro ao remover", "error"));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Calcular dias desde adoção
  const daysSince = (dateStr) => {
    if (!dateStr) return 0;
    const diff = Date.now() - new Date(dateStr).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <AppShell title="Pós-Adoção">
        <div className="spinner-global">
          <div className="ring" />
          <p>Carregando...</p>
        </div>
      </AppShell>
    );
  }

  // ── Vista detalhada de uma adoção ──
  if (selectedAdocao) {
    const pet = selectedAdocao.pet;
    const dias = daysSince(selectedAdocao.data_adocao);
    const checkCount = CHECKLIST_ITEMS.filter(
      (i) => checkedItems[`${selectedAdocao.adocao_id}_${i.id}`]
    ).length;

    return (
      <AppShell title="Pós-Adoção">
        {toast && (
          <div className={`pos-toast ${toast.type}`}>{toast.message}</div>
        )}

        <div className="pos-page">
          <button className="pos-back-btn" onClick={handleBack}>
            ← Voltar
          </button>

          {/* Hero do pet */}
          <div className="pos-pet-hero">
            <img className="pos-pet-hero-img" src={pet.foto} alt={pet.nome} />
            <div className="pos-pet-hero-info">
              <h2>{pet.nome}</h2>
              <p className="pos-pet-breed">
                🐾 {pet.especie} {pet.idade ? `· ${pet.idade} anos` : ""}
              </p>
              <div className="pos-days-badge">
                <span className="pos-days-number">{dias}</span>
                <span className="pos-days-label">dias juntos</span>
              </div>
            </div>
          </div>

          {/* Checklist de cuidados iniciais */}
          <div className="pos-section">
            <div className="pos-section-header">
              <h3>📋 Checklist Inicial</h3>
              <span className="pos-progress">{checkCount}/{CHECKLIST_ITEMS.length}</span>
            </div>
            <div className="pos-progress-bar">
              <div
                className="pos-progress-fill"
                style={{ width: `${(checkCount / CHECKLIST_ITEMS.length) * 100}%` }}
              />
            </div>
            <div className="pos-checklist">
              {CHECKLIST_ITEMS.map((item) => {
                const key = `${selectedAdocao.adocao_id}_${item.id}`;
                const isChecked = !!checkedItems[key];
                return (
                  <label
                    key={item.id}
                    className={`pos-check-item ${isChecked ? "checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCheck(selectedAdocao.adocao_id, item.id)}
                    />
                    <span className="pos-check-icon">{item.icon}</span>
                    <span className="pos-check-text">{item.text}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dicas de Cuidado */}
          {(() => {
            const species = detectSpecies(pet.especie);
            const ageGroup = getAgeGroup(pet.idade, species);
            const tips = CARE_TIPS[species]?.[ageGroup];
            if (!tips) return null;

            return (
              <div className="pos-section">
                <div className="pos-section-header">
                  <h3>💡 Dicas de Cuidado</h3>
                  <span className="pos-tips-context">
                    {SPECIES_LABELS[species]} · {AGE_GROUP_LABELS[ageGroup]}
                  </span>
                </div>
                <p className="pos-tips-subtitle">
                  Dicas personalizadas para {pet.nome}, baseadas na espécie e idade
                </p>

                <div className="pos-tips-categories">
                  {CARE_CATEGORIES.map((cat) => {
                    const catTips = tips[cat.key];
                    if (!catTips || catTips.length === 0) return null;
                    const isExpanded = expandedTipCategory === cat.key;

                    return (
                      <div key={cat.key} className="pos-tip-category">
                        <button
                          className={`pos-tip-category-btn ${isExpanded ? "active" : ""}`}
                          style={{ "--cat-color": cat.color }}
                          onClick={() => {
                            setExpandedTipCategory(isExpanded ? null : cat.key);
                            setExpandedTipIndex(null);
                          }}
                        >
                          <span className="pos-tip-cat-icon">{cat.icon}</span>
                          <span className="pos-tip-cat-label">{cat.label}</span>
                          <span className="pos-tip-cat-count">{catTips.length}</span>
                          <span className={`pos-tip-chevron ${isExpanded ? "open" : ""}`}>▸</span>
                        </button>

                        {isExpanded && (
                          <div className="pos-tip-list">
                            {catTips.map((tip, idx) => {
                              const isTipOpen = expandedTipIndex === idx;
                              return (
                                <div
                                  key={idx}
                                  className={`pos-tip-card ${isTipOpen ? "open" : ""}`}
                                  style={{ animationDelay: `${idx * 0.06}s` }}
                                >
                                  <button
                                    className="pos-tip-card-header"
                                    onClick={() => setExpandedTipIndex(isTipOpen ? null : idx)}
                                  >
                                    <span className="pos-tip-card-title">{tip.title}</span>
                                    <span className={`pos-tip-chevron small ${isTipOpen ? "open" : ""}`}>▸</span>
                                  </button>
                                  {isTipOpen && (
                                    <p className="pos-tip-card-text">{tip.text}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Diário / Timeline */}
          <div className="pos-section">
            <div className="pos-section-header">
              <h3>📖 Diário</h3>
              <button
                className="pos-add-btn"
                onClick={() => setFormOpen(!formOpen)}
              >
                {formOpen ? "Cancelar" : "+ Novo registro"}
              </button>
            </div>

            {/* Formulário */}
            {formOpen && (
              <form className="pos-form" onSubmit={handleSubmitEntry}>
                <div className="pos-form-types">
                  {Object.entries(TIPO_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`pos-type-btn ${formData.tipo === key ? "active" : ""}`}
                      onClick={() => setFormData({ ...formData, tipo: key })}
                    >
                      {TIPO_ICONS[key]} {label}
                    </button>
                  ))}
                </div>
                <input
                  className="pos-form-input"
                  name="titulo"
                  placeholder="Título (ex: Primeira vacina)"
                  value={formData.titulo}
                  onChange={handleFormChange}
                  required
                />
                <textarea
                  className="pos-form-textarea"
                  name="descricao"
                  placeholder="Descrição (opcional)"
                  value={formData.descricao}
                  onChange={handleFormChange}
                  rows={3}
                />
                <button type="submit" className="pos-form-submit">
                  💾 Salvar Registro
                </button>
              </form>
            )}

            {/* Timeline */}
            {diarioLoading ? (
              <div className="spinner-global" style={{ minHeight: 100 }}>
                <div className="ring" />
              </div>
            ) : diario.length === 0 ? (
              <div className="pos-empty-diary">
                <p>📝 Nenhum registro ainda. Clique em "+ Novo registro" para começar!</p>
              </div>
            ) : (
              <div className="pos-timeline">
                {diario.map((entry) => (
                  <div key={entry.id} className="pos-timeline-item">
                    <div className="pos-timeline-dot">
                      {TIPO_ICONS[entry.tipo] || "📝"}
                    </div>
                    <div className="pos-timeline-content">
                      <div className="pos-timeline-header">
                        <span className={`pos-tipo-badge tipo-${entry.tipo}`}>
                          {TIPO_LABELS[entry.tipo] || entry.tipo}
                        </span>
                        <span className="pos-timeline-date">
                          {formatDate(entry.data_registro)}
                        </span>
                      </div>
                      <h4 className="pos-timeline-title">{entry.titulo}</h4>
                      {entry.descricao && (
                        <p className="pos-timeline-desc">{entry.descricao}</p>
                      )}
                      <button
                        className="pos-timeline-delete"
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Remover registro"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Lista de adoções ──
  return (
    <AppShell title="Pós-Adoção">
      {toast && (
        <div className={`pos-toast ${toast.type}`}>{toast.message}</div>
      )}

      <div className="pos-page">
        <div className="pos-hero">
          <h2 className="pos-hero-title">🐾 Pós-Adoção</h2>
          <p className="pos-hero-subtitle">
            Acompanhe seus pets adotados, registre marcos e mantenha o diário de cuidados
          </p>
        </div>

        {adocoes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>Nenhuma adoção registrada</h3>
            <p>
              Quando você adotar um pet, ele aparecerá aqui para você
              acompanhar seus cuidados e evolução!
            </p>
          </div>
        ) : (
          <div className="pos-grid">
            {adocoes.map((adocao, idx) => {
              const dias = daysSince(adocao.data_adocao);
              return (
                <div
                  key={adocao.adocao_id}
                  className="pos-card"
                  onClick={() => handleSelectAdocao(adocao)}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="pos-card-image-wrap">
                    <img
                      className="pos-card-image"
                      src={adocao.pet.foto}
                      alt={adocao.pet.nome}
                    />
                    <div className="pos-card-days">
                      <span>{dias}</span>
                      <small>dias</small>
                    </div>
                  </div>
                  <div className="pos-card-body">
                    <h3>{adocao.pet.nome}</h3>
                    <p className="pos-card-breed">
                      🐾 {adocao.pet.especie}
                    </p>
                    <p className="pos-card-date">
                      📅 Adotado em {formatDateShort(adocao.data_adocao)}
                    </p>
                    <div className="pos-card-stats">
                      <span className="pos-stat">
                        📖 {adocao.total_diario} registro{adocao.total_diario !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <button className="pos-card-cta">
                      Ver Diário →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
