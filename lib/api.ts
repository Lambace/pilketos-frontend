const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper umum
export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// Login
export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login gagal");
  return res.json();
}

// Ambil kandidat
export async function getCandidates() {
  return apiFetch("/candidates");
}

// Tambah kandidat
export async function addCandidate(formData: FormData) {
  return apiFetch("/candidates", { method: "POST", body: formData });
}

// Ambil hasil vote
export async function getResults() {
  return apiFetch("/results");
}
