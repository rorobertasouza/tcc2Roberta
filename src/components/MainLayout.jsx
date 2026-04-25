import React, { useState } from "react";
import PetApp from "./PetApp";
import Profile from "./Profile";
import "./MainLayout.css"; // importa o CSS


export default function MainLayout() {
  const [activeTab, setActiveTab] = useState("pets");

  return (
    <div className="app-container">
      {/* Navbar fixa */}
      <nav className="navbar">
        <button
          className={activeTab === "pets" ? "active" : ""}
          onClick={() => setActiveTab("pets")}
        >
          🐶 Pets
        </button>
        <button
          className={activeTab === "perfil" ? "active" : ""}
          onClick={() => setActiveTab("perfil")}
        >
          👤 Perfil
        </button>
      </nav>

      {/* Título sempre visível */}
      <h2 className="app-title">Find Friend Animal</h2>

      {/* Área central que troca o conteúdo */}
      <div className="content">
        {activeTab === "perfil" ? <Profile /> : <PetApp />}
      </div>
    </div>
  );
}
