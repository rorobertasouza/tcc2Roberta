import React, { useState } from "react";

export default function Register({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Novos estados
  const [residencia, setResidencia] = useState("");
  const [espaco, setEspaco] = useState("");
  const [tempo, setTempo] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [preferenciaEspecie, setPreferenciaEspecie] = useState("");
  const [preferenciaPorte, setPreferenciaPorte] = useState("");
  const [preferenciaIdade, setPreferenciaIdade] = useState("");
  const [preferenciaSexo, setPreferenciaSexo] = useState("");
  const [aceitaEspecial, setAceitaEspecial] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("residencia", residencia);
    formData.append("espaco", espaco);
    formData.append("tempo", tempo);
    formData.append("experiencia", experiencia);
    formData.append("preferencia_especie", preferenciaEspecie);
    formData.append("preferencia_porte", preferenciaPorte);
    formData.append("preferencia_idade", preferenciaIdade);
    formData.append("preferencia_sexo", preferenciaSexo);
    formData.append("aceita_especial", aceitaEspecial);

    fetch("http://localhost/find-animal-friend-react/api/register.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.text())
      .then(text => {
        try {
          const data = JSON.parse(text);
          if (data.success) {
            alert("Cadastro realizado com sucesso!");
            onBack();
          } else {
            alert(data.message || "Erro ao cadastrar.");
          }
        } catch (err) {
          alert("Erro inesperado na resposta do servidor.");
        }
      })
      .catch(err => console.error("Erro na requisição:", err));
  };

  return (
    <div className="auth-container">
      <h1 className="app-title">Cadastro</h1>
      <form className="auth-form" onSubmit={handleRegister}>
        <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />

        {/* Novos campos */}
        <input type="text" placeholder="Tipo de residência" value={residencia} onChange={e => setResidencia(e.target.value)} />
        <input type="text" placeholder="Espaço disponível" value={espaco} onChange={e => setEspaco(e.target.value)} />
        <input type="text" placeholder="Tempo disponível para o pet" value={tempo} onChange={e => setTempo(e.target.value)} />
        <input type="text" placeholder="Experiência prévia com animais" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
        <input type="text" placeholder="Espécie desejada" value={preferenciaEspecie} onChange={e => setPreferenciaEspecie(e.target.value)} />
        <input type="text" placeholder="Porte preferido" value={preferenciaPorte} onChange={e => setPreferenciaPorte(e.target.value)} />
        <input type="text" placeholder="Faixa etária desejada" value={preferenciaIdade} onChange={e => setPreferenciaIdade(e.target.value)} />
        <input type="text" placeholder="Sexo preferido" value={preferenciaSexo} onChange={e => setPreferenciaSexo(e.target.value)} />
        <input type="text" placeholder="Aceita necessidades especiais (sim/não)" value={aceitaEspecial} onChange={e => setAceitaEspecial(e.target.value)} />

        <button type="submit">Cadastrar</button>
      </form>
      <div className="signup-link" onClick={onBack}>
        Voltar para login
      </div>
    </div>
  );
}
