const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("API tidak merespons dengan status OK");
  }

  return response.json();
}
