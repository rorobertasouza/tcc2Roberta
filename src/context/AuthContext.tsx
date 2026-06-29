import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface UserInfo {
  id: number;
  nome: string;
  email: string;
  residencia?: string;
  espaco?: string;
  tempo?: string;
  experiencia?: string;
  preferencia_especie?: string;
  preferencia_porte?: string;
  preferencia_idade?: string;
  preferencia_sexo?: string;
  aceita_especial?: string;
  tem_pet?: string;
  cidade?: string;
  estado?: string;
}

export interface OngInfo {
  id: number;
  nome: string;
  email: string;
  cnpj?: string;
  telefone?: string;
  cidade?: string;
  estado?: string;
}

interface AuthState {
  user: UserInfo | null;
  ong: OngInfo | null;
  loading: boolean;
}

type AuthAction =
  | { type: "LOGIN_USER"; payload: UserInfo }
  | { type: "LOGOUT_USER" }
  | { type: "LOGIN_ONG"; payload: OngInfo }
  | { type: "LOGOUT_ONG" }
  | { type: "INITIALIZE"; payload: { user: UserInfo | null; ong: OngInfo | null } };

interface AuthContextType {
  state: AuthState;
  loginUser: (user: UserInfo) => void;
  logoutUser: () => void;
  loginOng: (ong: OngInfo) => void;
  logoutOng: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// NOTA PRO TCC: Reducer para controle centralizado do estado de autenticação (Padrão Flux)
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_USER":
      return { ...state, user: action.payload, ong: null };
    case "LOGOUT_USER":
      return { ...state, user: null };
    case "LOGIN_ONG":
      return { ...state, ong: action.payload, user: null };
    case "LOGOUT_ONG":
      return { ...state, ong: null };
    case "INITIALIZE":
      return { ...state, user: action.payload.user, ong: action.payload.ong, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    ong: null,
    loading: true,
  });

  // NOTA PRO TCC: Sincronização do estado a partir do LocalStorage ao carregar a aplicação (hidratação de estado)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedOng = localStorage.getItem("ong");
      
      const user = storedUser ? (JSON.parse(storedUser) as UserInfo) : null;
      const ong = storedOng ? (JSON.parse(storedOng) as OngInfo) : null;
      
      dispatch({ type: "INITIALIZE", payload: { user, ong } });
    } catch (e) {
      console.error("Erro ao inicializar sessão do localStorage", e);
      dispatch({ type: "INITIALIZE", payload: { user: null, ong: null } });
    }
  }, []);

  // NOTA PRO TCC: Ações de login e logout com persistência local e atualização do estado global
  const loginUser = (user: UserInfo) => {
    localStorage.setItem("user", JSON.stringify(user));
    dispatch({ type: "LOGIN_USER", payload: user });
  };

  const logoutUser = () => {
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT_USER" });
  };

  const loginOng = (ong: OngInfo) => {
    localStorage.setItem("ong", JSON.stringify(ong));
    dispatch({ type: "LOGIN_ONG", payload: ong });
  };

  const logoutOng = () => {
    localStorage.removeItem("ong");
    dispatch({ type: "LOGOUT_ONG" });
  };

  return (
    <AuthContext.Provider value={{ state, loginUser, logoutUser, loginOng, logoutOng }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
