const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os dados.");
  }

  return response.json() as Promise<T>;
}
