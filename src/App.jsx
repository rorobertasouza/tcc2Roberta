import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

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
    <AuthProvider>
      <BrowserRouter basename="/find-animal-friend-react/dist">
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Auth />} />
          <Route path="/ong-register" element={<OngRegister />} />
          <Route path="/ong-login" element={<OngLogin />} />

          {/* Rotas Protegidas do Usuário Adotante */}
          <Route element={<ProtectedRoute allowedRole="user" />}>
            <Route path="/home" element={<Home />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/matches" element={<MyMatches />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/pos-adocao" element={<PosAdocao />} />
          </Route>

          {/* Rotas Protegidas da ONG */}
          <Route element={<ProtectedRoute allowedRole="ong" />}>
            <Route path="/cadastro-pet" element={<CadastroPet />} />
            <Route path="/dashboard" element={<CadastroPet />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
