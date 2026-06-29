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

// NOTA PRO TCC: Broadcast tipado para atualizar os pets nos clientes conectados
async function broadcastPetsUpdate() {
  console.log(`Atualizando ${clients.size} cliente(s)...`);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        const pets = await getPets(client.userId);
        client.send(JSON.stringify({
          type: "pets_update",
          pets: pets
        }));
      } catch (err) {
        console.error(`Erro no cliente ${client.userId}:`, err);
      }
    }
  }
}

// NOTA PRO TCC: Evento em tempo real para adoção imediata
function broadcastAdoption(petId) {
  console.log(`Broadcast: pet ${petId} adotado`);
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

// NOTA PRO TCC: Notifica atualização de favoritos especificamente para o próprio usuário (unicast)
function broadcastFavoriteUpdate(userId, petId, action) {
  const message = JSON.stringify({
    type: "favorite_update",
    user_id: userId,
    pet_id: petId,
    action: action
  });

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

  // Carrega pets no primeiro login
  try {
    const pets = await getPets(userId);
    ws.send(JSON.stringify({
      type: "pets_update",
      pets: pets
    }));
  } catch (err) {
    console.error("Erro carga inicial pets:", err);
  }

  // NOTA PRO TCC: Polling passivo de 15 segundos para garantir que o cliente não fique desatualizado caso o WebSocket perca eventos
  const interval = setInterval(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        const pets = await getPets(userId);
        ws.send(JSON.stringify({
          type: "pets_update",
          pets: pets
        }));
      } catch (err) {
        console.error("Erro no polling passivo:", err);
      }
    }
  }, 15000);

  // Escuta mensagens enviadas pelos clientes
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.action === 'adopt' && data.pet_id) {
        console.log(`Ação: adopt pet_id: ${data.pet_id}`);
        
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
          broadcastAdoption(data.pet_id);
          await broadcastPetsUpdate();
        } else {
          console.error("Erro ao adotar via API:", resData.message);
        }
      }

      if (data.action === 'toggle_favorite' && data.pet_id && data.user_id) {
        console.log(`Ação: toggle_favorite pet_id=${data.pet_id}`);
        
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
      console.error("Erro no processamento de mensagem WS:", err);
    }
  });

  // NOTA PRO TCC: Cleanup do cliente na desconexão (deleta do set e limpa interval para evitar memory leaks)
  ws.on('close', () => {
    console.log("Conexão encerrada");
    clients.delete(ws);
    clearInterval(interval);
  });
});

console.log("WebSocket rodando na porta 3002");
