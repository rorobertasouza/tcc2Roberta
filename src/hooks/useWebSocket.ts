import { useEffect, useRef, useState } from "react";

export default function useWebSocket(userId?: string | number | null) {
  const [pets, setPets] = useState<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<number | null>(null);

  useEffect(() => {
    const query = userId ? `?user_id=${encodeURIComponent(String(userId))}` : "";
    const socketUrl = `ws://localhost:3001${query}`;
    let shouldReconnect = true;

    const connectWebSocket = () => {
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Conectado ao WebSocket", socketUrl);
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Dados recebidos do WebSocket:", data);

        if (Array.isArray(data)) {
          setPets(data);
        } else if (data?.pets) {
          setPets(data.pets);
        }
      };

      socket.onclose = () => {
        if (!shouldReconnect) return;
        console.log("Conexão WebSocket fechada, reconectando em 3s...");
        reconnectTimeout.current = window.setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => {
        console.error("Erro WebSocket:", err);
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
      if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
        socketRef.current.close();
      }
    };
  }, [userId]);

  return pets;
}
