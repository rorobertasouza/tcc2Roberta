import React, { useState, useEffect } from "react";
import "./Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // Carregar perfil do usuário logado
  useEffect(() => {
    fetch("http://localhost/find-animal-friend-react/api/perfil.php", {
      method: "GET",
      credentials: "include" // mantém sessão
    })
      .then(res => res.json())
      .then(data => {
        console.log("Resposta da API:", data);
        if (data.success && data.data) {
          setProfile(data.data);
        } else {
          alert(data.message || "Não foi possível carregar o perfil");
        }
      })
      .catch(err => console.error("Erro ao carregar perfil:", err));
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Salvar alterações no perfil
  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(profile).forEach(key => formData.append(key, profile[key]));

    fetch("http://localhost/find-animal-friend-react/api/perfil.php", {
      method: "POST",
      body: formData,
      credentials: "include" // mantém sessão
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        if (data.success) {
          setIsEditing(false);
        }
      })
      .catch(err => console.error("Erro ao salvar perfil:", err));
  };

  return (
    <div className="profile-card">
      <h2 className="profile-name">{profile.nome || "Seu Nome"}</h2>
      <p className="profile-info">
        {profile.residencia || "Cidade"} • {profile.espaco || "Espaço disponível"}
      </p>

      {!isEditing ? (
        <div className="profile-details">
          <ul>
            <li><strong>Email:</strong> {profile.email || "—"}</li>
            <li><strong>Tempo livre:</strong> {profile.tempo || "—"}</li>
            <li><strong>Experiência:</strong> {profile.experiencia || "—"}</li>
            <li><strong>Espécie preferida:</strong> {profile.preferencia_especie || "—"}</li>
            <li><strong>Porte preferido:</strong> {profile.preferencia_porte || "—"}</li>
            <li><strong>Idade preferida:</strong> {profile.preferencia_idade || "—"}</li>
            <li><strong>Sexo preferido:</strong> {profile.preferencia_sexo || "—"}</li>
            <li><strong>Aceita necessidades especiais:</strong> {profile.aceita_especial || "—"}</li>
          </ul>
          <button className="edit-btn" onClick={() => setIsEditing(true)}>Editar Perfil ✏️</button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="profile-form">
          <input name="nome" value={profile.nome || ""} onChange={handleChange} placeholder="Nome" />
          <input name="email" value={profile.email || ""} onChange={handleChange} placeholder="Email" />
          <input name="residencia" value={profile.residencia || ""} onChange={handleChange} placeholder="Cidade" />
          <input name="espaco" value={profile.espaco || ""} onChange={handleChange} placeholder="Espaço disponível" />
          <input name="tempo" value={profile.tempo || ""} onChange={handleChange} placeholder="Tempo livre" />
          <input name="experiencia" value={profile.experiencia || ""} onChange={handleChange} placeholder="Experiência com pets" />
          <input name="preferencia_especie" value={profile.preferencia_especie || ""} onChange={handleChange} placeholder="Espécie preferida" />
          <input name="preferencia_porte" value={profile.preferencia_porte || ""} onChange={handleChange} placeholder="Porte preferido" />
          <input name="preferencia_idade" value={profile.preferencia_idade || ""} onChange={handleChange} placeholder="Idade preferida" />
          <input name="preferencia_sexo" value={profile.preferencia_sexo || ""} onChange={handleChange} placeholder="Sexo preferido" />
          <input name="aceita_especial" value={profile.aceita_especial || ""} onChange={handleChange} placeholder="Aceita necessidades especiais?" />

          <button type="submit" className="save-btn">Salvar alterações</button>
        </form>
      )}
    </div>
  );
}
