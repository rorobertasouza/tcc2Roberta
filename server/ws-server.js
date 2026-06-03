const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({ port: 3002 });
const clients = new Set();

async function getPets(userId) {
  const url = userId
    ? `http://localhost/find-animal-friend-react/api/pets.php?user_id=${userId}`
    : "http://localhost/find-animal-friend-react/api/pets.php";
  
  const res = await fetch(url);
  return await res.json();
}

// Broadcast tipado para todos os clientes
async function broadcastPetsUpdate() {
  console.log(`Transmitindo atualizacao para ${clients.size} cliente(s)...`);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        const pets = await getPets(client.userId);
        client.send(JSON.stringify({
          type: "pets_update",
          pets: pets
        }));
      } catch (err) {
        console.error(`Erro ao atualizar cliente ${client.userId}:`, err);
      }
    }
  }
}

// Broadcast específico de adoção para todos (tempo real)
function broadcastAdoption(petId) {
  console.log(`Broadcast: pet ${petId} foi adotado!`);
  const message = JSON.stringify({
    type: "pet_adopted",
    pet_id: petId,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Broadcast de toggle favorito
function broadcastFavoriteUpdate(userId, petId, action) {
  const message = JSON.stringify({
    type: "favorite_update",
    user_id: userId,
    pet_id: petId,
    action: action // "added" ou "removed"
  });

  // Enviar apenas para o próprio usuário
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN && String(client.userId) === String(userId)) {
      client.send(message);
    }
  }
}

wss.on('connection', async (ws, req) => {
  console.log("Cliente conectado");

  const urlParams = new URL(req.url, 'http://localhost:3002');
  const userId = urlParams.searchParams.get('user_id');

  ws.userId = userId;
  clients.add(ws);

  // Envia lista inicial com tipo
  try {
    const pets = await getPets(userId);
    ws.send(JSON.stringify({
      type: "pets_update",
      pets: pets
    }));
  } catch (err) {
    console.error("Erro ao buscar lista inicial de pets:", err);
  }

  // Atualiza a cada 15s (passiva)
  const interval = setInterval(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        const pets = await getPets(userId);
        ws.send(JSON.stringify({
          type: "pets_update",
          pets: pets
        }));
      } catch (err) {
        console.error("Erro no intervalo de atualizacao passiva:", err);
      }
    }
  }, 15000);

  // Tratar mensagens recebidas do cliente
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // ── Adotar pet ──
      if (data.action === 'adopt' && data.pet_id) {
        console.log(`Recebido 'adopt' para pet_id: ${data.pet_id} de user_id: ${data.user_id || 'desconhecido'}`);
        
        const response = await fetch('http://localhost/find-animal-friend-react/api/adotar.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            pet_id: data.pet_id,
            user_id: data.user_id || null
          })
        });
        const resData = await response.json();
        
        if (resData.success) {
          console.log(`Pet ${data.pet_id} adotado. Broadcast imediato...`);
          // Primeiro: broadcast imediato da adoção (tempo real)
          broadcastAdoption(data.pet_id);
          // Depois: atualização completa da lista
          await broadcastPetsUpdate();
        } else {
          console.error("Erro na API de adocao:", resData.message);
        }
      }

      // ── Toggle favorito ──
      if (data.action === 'toggle_favorite' && data.pet_id && data.user_id) {
        console.log(`Toggle favorito: pet_id=${data.pet_id}, user_id=${data.user_id}`);
        
        const response = await fetch('http://localhost/find-animal-friend-react/api/favoritos.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pet_id: data.pet_id,
            user_id: data.user_id
          })
        });
        const resData = await response.json();
        
        if (resData.success) {
          broadcastFavoriteUpdate(data.user_id, data.pet_id, resData.action);
        }
      }
    } catch (err) {
      console.error("Erro ao tratar mensagem do WebSocket:", err);
    }
  });

  ws.on('close', () => {
    console.log("Conexão fechada");
    clients.delete(ws);
    clearInterval(interval);
  });
});

console.log("WebSocket rodando na porta 3002");
