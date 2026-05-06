import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./components/Auth.jsx";
import Home from "./pages/Home";
import Listagem from "./pages/Listagem";
import PetDetail from "./pages/Detail";
import Config from "./pages/Config";
import CadastroPet from "./pages/CadastroPet";
import OngRegister from "./components/OngRegister.jsx"; // nova página de cadastro de ONG

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Auth />} />

        {/* Páginas principais */}
        <Route path="/home" element={<Home />} />
        <Route path="/listagem" element={<Listagem />} />
        <Route path="/pet/:id" element={<PetDetail />} />
        <Route path="/config" element={<Config />} />

        {/* Cadastro de pets (ONG) */}
        <Route path="/cadastro-pet" element={<CadastroPet />} />

        {/* Cadastro de ONG */}
        <Route path="/ong-register" element={<OngRegister />} />
      </Routes>
    </BrowserRouter>
  );
}
