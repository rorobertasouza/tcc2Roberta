import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE, WS_URL } from "../config.js";

interface Pet {
  id: number;
  nome: string;
  descricao: string;
  foto: string;
  idade: string;
  especie: string;
  local: string;
  porte: string;
  sexo: string;
  contato: string;
  vacinado: string;
  castrado: string;
  adotado: number;
  compatibilidade: number;
  latitude: number | null;
  longitude: number | null;
  distancia_km: number | null;
  favorito: number;
}

interface WSMessage {
  type: "pets_update" | "pet_adopted" | "favorite_update";
  pets?: Pet[];
  pet_id?: number;
  user_id?: number;
  action?: string;
  timestamp?: string;
}

export default function useWebSocket(userId?: string | number | null) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [adoptedPetIds, setAdoptedPetIds] = useState<Set<number>>(new Set());
  const [favoritePetIds, setFavoritePetIds] = useState<Set<number>>(new Set());
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  // Enviar ação de adotar com atualização otimista e fallback HTTP
  const adoptPet = useCallback((petId: string | number, adoptUserId?: string | number) => {
    const numId = Number(petId);
    const targetUserId = adoptUserId || userId;

    // Atualização Otimista local
    setPets(prev => prev.map(p =>
      Number(p.id) === numId ? { ...p, adotado: 1 } : p
    ));
    setAdoptedPetIds(prev => new Set(prev).add(numId));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: "adopt",
        pet_id: numId,
        user_id: targetUserId
      }));
    } else {
      console.warn("WebSocket não está aberto para adoção. Enviando via REST API.");
      fetch(`${API_BASE}/adotar.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: numId, user_id: targetUserId }),
        credentials: "include"
      }).catch(err => console.error("Erro no fallback da adoção:", err));
    }
  }, [userId]);

  // Enviar ação de toggle favorito com atualização otimista e fallback HTTP
  const toggleFavorite = useCallback((petId: string | number) => {
    const numId = Number(petId);

    // Atualização Otimista local
    setPets(prev => prev.map(p =>
      Number(p.id) === numId ? { ...p, favorito: p.favorito === 1 ? 0 : 1 } : p
    ));
    setFavoritePetIds(prev => {
      const next = new Set(prev);
      if (next.has(numId)) {
        next.delete(numId);
      } else {
        next.add(numId);
      }
      return next;
    });

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        action: "toggle_favorite",
        pet_id: numId,
        user_id: userId
      }));
    } else {
      console.warn("WebSocket não está aberto para favoritar. Enviando via REST API.");
      fetch(`${API_BASE}/favoritos.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: numId, user_id: userId }),
        credentials: "include"
      }).catch(err => console.error("Erro no fallback do favorito:", err));
    }
  }, [userId]);

  useEffect(() => {
    // Se WS_URL for null (ex: Ngrok), não conecta WebSocket — usa fallback HTTP
    if (!WS_URL) {
      console.log("WebSocket desabilitado neste ambiente. Usando fallback HTTP.");
      return;
    }

    const query = userId ? `?user_id=${encodeURIComponent(String(userId))}` : "";
    const socketUrl = `${WS_URL}${query}`;
    let shouldReconnect = true;

    const connectWebSocket = () => {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Conectado ao WebSocket", socketUrl);
      };

      socket.onmessage = (event) => {
        try {
          const data: WSMessage = JSON.parse(event.data);
          console.log("WS mensagem recebida:", data.type);

          switch (data.type) {
            case "pets_update":
              if (Array.isArray(data.pets)) {
                const castedPets = data.pets.map((p: any) => ({
                  ...p,
                  id: Number(p.id),
                  adotado: Number(p.adotado),
                  favorito: Number(p.favorito)
                }));
                setPets(castedPets);
                // Atualizar sets
                const adopted = new Set<number>();
                const favorited = new Set<number>();
                castedPets.forEach((p: Pet) => {
                  if (p.adotado === 1) adopted.add(p.id);
                  if (p.favorito === 1) favorited.add(p.id);
                });
                setAdoptedPetIds(adopted);
                setFavoritePetIds(favorited);
              }
              break;

            case "pet_adopted":
              if (data.pet_id) {
                const adoptedId = Number(data.pet_id);
                // Atualizar imediatamente o pet na lista local
                setPets(prev => prev.map(p =>
                  Number(p.id) === adoptedId ? { ...p, adotado: 1 } : p
                ));
                setAdoptedPetIds(prev => new Set(prev).add(adoptedId));
                console.log(`🏠 Pet ${adoptedId} marcado como adotado em tempo real!`);
              }
              break;

            case "favorite_update":
              if (data.pet_id) {
                const favId = Number(data.pet_id);
                setPets(prev => prev.map(p =>
                  Number(p.id) === favId ? { ...p, favorito: data.action === "added" ? 1 : 0 } : p
                ));
                setFavoritePetIds(prev => {
                  const next = new Set(prev);
                  if (data.action === "added") next.add(favId);
                  else next.delete(favId);
                  return next;
                });
              }
              break;

            default:
              // Formato legado (array direto)
              if (Array.isArray(data)) {
                setPets(data as unknown as Pet[]);
              } else if ((data as any)?.pets) {
                setPets((data as any).pets);
              }
          }
        } catch (err) {
          console.error("Erro ao parsear mensagem WS:", err);
        }
      };

      socket.onclose = () => {
        if (!shouldReconnect) return;
        console.log("Conexão WebSocket fechada, reconectando em 3s...");
        reconnectTimeout.current = window.setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => {
        if (shouldReconnect) {
          console.error("Erro WebSocket:", err);
        }
        if (socket.readyState !== WebSocket.CLOSED) {
          try {
            socket.close();
          } catch (e) {
            console.warn("Erro ao fechar WebSocket após erro:", e);
          }
        }
      };
    };

    connectWebSocket();

    return () => {
      shouldReconnect = false;
      if (reconnectTimeout.current) {
        window.clearTimeout(reconnectTimeout.current);
      }
      if (socketRef.current) {
        const state = socketRef.current.readyState;
        if (state !== WebSocket.CLOSED && state !== WebSocket.CLOSING) {
          socketRef.current.close();
        }
      }
    };
  }, [userId]);

  return { pets, adoptPet, toggleFavorite, adoptedPetIds, favoritePetIds };
}
