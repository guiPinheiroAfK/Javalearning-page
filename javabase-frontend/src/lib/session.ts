const SESSION_STORAGE_KEY = "javabase:sessionId";

// Sem login: cada navegador gera um UUID uma única vez e persiste no localStorage.
// É esse ID que o backend usa pra rastrear progresso (ver UserProgress no backend).
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}
