import React, { useState } from "react";

function Register({ onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://localhost/find-animal-friend-react/api/register.php", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(() => {
        alert("Conta criada!");
        onBack();
      });
  };

  return (
    <div className="auth-container">
      <h2>Cadastrar</h2>

      <form onSubmit={handleRegister}>
        <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
        <button>Cadastrar</button>
      </form>

      <p onClick={onBack}>Voltar</p>
    </div>
  );
}

export default Register;