const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login gagal");
  return res.json();
}

export async function getCandidates() {
  const res = await fetch(`${API_URL}/candidates`);
  if (!res.ok) throw new Error("Gagal ambil kandidat");
  return res.json();
}

export async function addCandidate(formData: FormData) {
  const res = await fetch(`${API_URL}/candidates`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Gagal tambah kandidat");
  return res.json();
}
