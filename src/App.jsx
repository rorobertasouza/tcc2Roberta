import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Auth from "./components/Auth.jsx";       // login de usuário
import Home from "./pages/Home";
import CadastroPet from "./pages/CadastroPet";
import OngRegister from "./components/OngRegister.jsx";
import OngLogin from "./components/OngLogin.jsx";       // login da ONG
import Profile from "./components/Profile";
import MyMatches from "./components/MyMatches";
import Favoritos from "./components/Favoritos";
import PosAdocao from "./components/PosAdocao";




export default function App() {
  return (
    <BrowserRouter basename="/find-animal-friend-react/dist">
      <Routes>
        {/* Login usuário */}
        <Route path="/" element={<Auth />} />

        {/* Páginas principais */}
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/matches" element={<MyMatches />} />
        <Route path="/favoritos" element={<Favoritos />} />
        <Route path="/pos-adocao" element={<PosAdocao />} />

        {/* Cadastro de pets (ONG) */}
        <Route path="/cadastro-pet" element={<CadastroPet />} />

        {/* Fluxo ONG */}
        <Route path="/ong-register" element={<OngRegister />} />
        <Route path="/ong-login" element={<OngLogin />} />
        <Route path="/dashboard" element={<CadastroPet />} />
      </Routes>
    </BrowserRouter>
  );
}
