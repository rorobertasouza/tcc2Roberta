const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({ port: 3001 });

async function getPets(userId) {
  // Se tiver userId, passa como query param para filtrar por preferências
  const url = userId
    ? `http://localhost/find-animal-friend-react/api/pets.php?user_id=${userId}`
    : "http://localhost/find-animal-friend-react/api/pets.php";
  
  const res = await fetch(url);
  return await res.json();
}

wss.on('connection', async (ws, req) => {
  console.log("Cliente conectado");

  // Extrair user_id da URL de conexão (ex: ws://localhost:3001?user_id=5)
  const urlParams = new URL(req.url, 'http://localhost:3001');
  const userId = urlParams.searchParams.get('user_id');

  // envia lista inicial (filtrada por preferências)
  const pets = await getPets(userId);
  ws.send(JSON.stringify(pets));

  // atualiza a cada 10s (para captar novos pets cadastrados)
  const interval = setInterval(async () => {
    if (ws.readyState === WebSocket.OPEN) {
      const pets = await getPets(userId);
      ws.send(JSON.stringify(pets));
    }
  }, 10000);

  ws.on('close', () => {
    console.log("Conexão fechada");
    clearInterval(interval);
  });
});

console.log("WebSocket rodando na porta 3001");
