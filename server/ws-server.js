const WebSocket = require('ws');
const fetch = require('node-fetch');

const wss = new WebSocket.Server({ port: 3001 });

async function getPets() {
  const res = await fetch("http://localhost/find-animal-friend-react/api/pets.php");
  return await res.json();
}

wss.on('connection', async (ws) => {
  console.log("Cliente conectado");

  // envia inicial
  ws.send(JSON.stringify(await getPets()));

  // atualiza a cada 5s
  setInterval(async () => {
    const pets = await getPets();
    ws.send(JSON.stringify(pets));
  }, 5000);
});

console.log("WebSocket rodando na porta 3001");
