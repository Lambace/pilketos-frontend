const API_URL = "https://voting-backend-production-ea29.up.railway.app";

// Helper Fetch agar tidak terjadi typo URL
async function apiFetch(endpoint: string, options: any = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Terjadi kesalahan pada server");
  }
  return data;
}

// --- 1. FITUR LOGIN (WAJIB ADA UNTUK LOGIN PAGE) ---
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// --- 2. MANAJEMEN SISWA ---
export async function getStudents() {
  return apiFetch("/students");
}

export async function addStudent(data: any) {
  return apiFetch("/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateStudent(nisn: string, data: any) {
  return apiFetch(`/students/${nisn}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(nisn: string) {
  return apiFetch(`/students/${nisn}`, { method: "DELETE" });
}

export async function importStudents(formData: FormData) {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

// --- 3. MANAJEMEN KANDIDAT ---
export async function getCandidates() {
  return apiFetch("/candidates");
}

export async function addCandidate(formData: FormData) {
  const res = await fetch(`${API_URL}/candidates`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function updateCandidate(id: number, formData: FormData) {
  const res = await fetch(`${API_URL}/candidates/${id}`, {
    method: "PUT",
    body: formData,
  });
  return res.json();
}

export async function deleteCandidate(id: number) {
  return apiFetch(`/candidates/${id}`, { method: "DELETE" });
}

// --- 4. VOTING ---
export async function submitVote(nisn: string, candidate_id: number) {
  return apiFetch("/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn, candidate_id }),
  });
}
