const API_URL = "https://voting-backend-production-ea29.up.railway.app";

/**
 * Helper untuk melakukan fetch ke API dengan penanganan error standar
 */
async function apiFetch(endpoint: string, options: any = {}) {
  const cleanBase = API_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const res = await fetch(`${cleanBase}${cleanEndpoint}`, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Error ${res.status}: Gagal menghubungi server`);
  }
  return res.json();
}

// --- 1. AUTHENTICATION ---
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// --- 2. DATA SISWA ---
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
  // Untuk FormData, kita tidak menggunakan apiFetch karena 'Content-Type' diatur otomatis oleh browser
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Gagal import data siswa");
  return res.json();
}

export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

/**
 * Menghapus semua data siswa dan data voting (Reset Total)
 */
export async function resetAllStudents() {
  return apiFetch("/students-reset-all", { method: "DELETE" });
}

// --- 3. DATA KANDIDAT ---
export async function getCandidates() {
  return apiFetch("/candidates");
}

export async function addCandidate(formData: FormData) {
  const res = await fetch(`${API_URL}/candidates`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Gagal menambah kandidat");
  return res.json();
}

export async function updateCandidate(id: string | number, formData: FormData) {
  const res = await fetch(`${API_URL}/candidates/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!res.ok) throw new Error("Gagal memperbarui kandidat");
  return res.json();
}

export async function deleteCandidate(id: string | number) {
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