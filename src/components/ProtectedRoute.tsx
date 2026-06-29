import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  allowedRole: "user" | "ong";
}

// NOTA PRO TCC: Guarda de Rotas (Route Guard) para autorização e controle de nível de acesso (Usuário comum vs ONG)
export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
  const { state } = useAuth();

  // NOTA PRO TCC: Previne redirecionamento prematuro exibindo uma tela de carregamento enquanto o estado de sessão é hidratado
  if (state.loading) {
    return (
      <div className="spinner-global" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
      }}>
        <div className="ring" />
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Carregando autenticação...</p>
      </div>
    );
  }

  if (allowedRole === "user") {
    if (!state.user) {
      return <Navigate to="/" replace />;
    }
  } else if (allowedRole === "ong") {
    if (!state.ong) {
      return <Navigate to="/ong-login" replace />;
    }
  }

  // NOTA PRO TCC: O Outlet renderiza o componente filho correspondente se a validação passar
  return <Outlet />;
}
