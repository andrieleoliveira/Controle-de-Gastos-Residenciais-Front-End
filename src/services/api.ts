const API_URL = "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro ${res.status}`);
  }


  if (res.status === 204) return undefined as T;

  return res.json();
}

export function get<T>(path: string) {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown) {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function del<T = void>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

export const endpoints = {
  pessoas: "/api/pessoas",
  pessoaById: (id: number) => `/api/pessoas/${id}`,

  categorias: "/api/categorias",

  transacoes: "/api/transacoes",

  relTotaisPorPessoa: "/api/relatorios/totais-por-pessoa",
  relTotaisPorCategoria: "/api/relatorios/totais-por-categoria",
};
