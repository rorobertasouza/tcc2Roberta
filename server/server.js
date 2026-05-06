const WebSocket = require("ws");
const mysql = require("mysql2");

// Conexão com o banco
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",        // ajuste conforme seu usuário
  password: "",        // ajuste conforme sua senha
  database: "adocao"   // nome do banco
});

const wss = new WebSocket.Server({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("Cliente conectado");

  // Buscar pets no banco
  db.query("SELECT id, name, breed, age, description, image FROM pets", (err, results) => {
    if (err) {
      console.error("Erro ao buscar pets:", err);
      ws.send(JSON.stringify({ error: "Erro ao buscar pets" }));
      return;
    }

    console.log("Pets encontrados:", results);
    // Envia lista de pets dentro de um objeto
    ws.send(JSON.stringify({ pets: results }));
  });

  ws.on("close", () => {
    console.log("Conexão fechada");
  });
});

console.log("WebSocket rodando na porta 3001");
