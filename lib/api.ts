const API_URL = "https://voting-backend-production-ea29.up.railway.app";

async function apiFetch(endpoint: string, options: any = {}) {
  // Membersihkan endpoint dari spasi tidak sengaja
  const cleanEndpoint = endpoint.trim();
  const res = await fetch(`${API_URL}${cleanEndpoint}`, options);
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(data.message || data.error || "Terjadi kesalahan pada server");
  }
  return data;
}

// --- 1. FITUR LOGIN ---
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// --- 2. FITUR VOTING & KANDIDAT ---
export async function getCandidates() {
  return apiFetch("/candidates");
}

export async function submitVote(nisn: string, candidate_id: number) {
  return apiFetch("/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn, candidate_id }),
  });
}

export async function addCandidate(formData: FormData) {
  const res = await fetch(`${API_URL}/candidates`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Gagal tambah kandidat");
  return data;
}

export async function updateCandidate(id: number, formData: FormData) {
  const res = await fetch(`${API_URL}/candidates/${id}`, {
    method: "PUT",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Gagal update kandidat");
  return data;
}

export async function deleteCandidate(id: number) {
  return apiFetch(`/candidates/${id}`, {
    method: "DELETE",
  });
}

// --- 3. MANAJEMEN SISWA (CRUD) ---
export async function getStudents() {
  try {
    return await apiFetch("/students");
  } catch (err) {
    console.error("Gagal mengambil siswa:", err);
    return [];
  }
}

export async function addStudent(data: { nisn: string; name: string; tingkat: string; kelas: string }) {
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
  return apiFetch(`/students/${nisn}`, { 
    method: "DELETE",
  });
}

export async function resetStudents() {
  return apiFetch("/students-reset-all", {
    method: "DELETE",
  });
}

// --- 4. HASIL ---
export async function getResults() {
  return apiFetch("/results");
}

// --- 5. IMPORT & DOWNLOAD ---
export async function importStudents(formData: FormData) {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData, 
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Gagal mengimpor data siswa");
  return data;
}

export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}
