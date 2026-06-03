/**
 * Configuração central de URLs da API.
 *
 * Em desenvolvimento local:       http://localhost/find-animal-friend-react/api
 * Com Ngrok:                       https://xxxx-xxx.ngrok-free.app/find-animal-friend-react/api
 *
 * A detecção é automática baseada no hostname da página.
 * Se o hostname for "localhost" ou "127.0.0.1", usa localhost.
 * Caso contrário (ex: URL do ngrok), usa o mesmo origin.
 */

const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// URL base da API PHP (sem barra no final)
export const API_BASE = isLocal
  ? "http://localhost/find-animal-friend-react/api"
  : `${window.location.origin}/find-animal-friend-react/api`;

// URL do WebSocket
// Em ambiente local, o WS roda na porta 3002.
// Com Ngrok, o WebSocket precisaria de um túnel separado,
// então fazemos fallback para HTTP quando não estiver disponível.
export const WS_URL = isLocal
  ? "ws://localhost:3002"
  : null; // WebSocket não disponível via Ngrok (fallback HTTP será usado)
