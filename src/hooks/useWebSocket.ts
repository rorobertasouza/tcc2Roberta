import { useEffect, useState } from "react";

export default function useWebSocket() {
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.onopen = () => {
      console.log("Conectado ao WebSocket");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Dados recebidos:", data);
      if (data.pets) {
        setPets(data.pets);
      }
    };

    socket.onclose = () => {
      console.log("Conexão fechada");
    };

    return () => socket.close();
  }, []);

  return pets;
}
