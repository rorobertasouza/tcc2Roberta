import { useEffect, useState } from "react";

export default function useWebSocket(isLoggedIn: boolean) {
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let socket: WebSocket;

    const connectWebSocket = () => {
      socket = new WebSocket("ws://localhost:3001");

      socket.onopen = () => {
        console.log("Conectado ao WebSocket");
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Dados recebidos:", data);

        if (Array.isArray(data)) {
          setPets(data);
        } else if (data.pets) {
          setPets(data.pets);
        }
      };

      socket.onclose = () => {
        console.log("Conexão fechada, tentando reconectar...");
        setTimeout(connectWebSocket, 3000);
      };

      socket.onerror = (err) => {
        console.error("Erro WebSocket:", err);
        socket.close();
      };
    };

    connectWebSocket();

    return () => socket && socket.close();
  }, [isLoggedIn]);

  return pets;
}
