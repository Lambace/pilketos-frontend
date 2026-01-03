const API_URL = "https://voting-backend-production-ea29.up.railway.app";

// Helper untuk fetch dasar dengan penanganan error yang lebih detail
async function apiFetch(endpoint: string, options: any = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  
  // Ambil data respon (baik sukses maupun gagal)
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

// ✅ Tambah Kandidat
export async function addCandidate(data: any) {
  return apiFetch("/candidates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ✅ UPDATE KANDIDAT (PENTING: Untuk fitur Edit)
export async function updateCandidate(id: number, data: any) {
  return apiFetch(`/candidates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ✅ Hapus Kandidat
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

// --- 4. FITUR HASIL VOTE (QUICK COUNT) ---

// ✅ Ambil hasil untuk Chart
export async function getResults() {
  return apiFetch("/results");
}

// ✅ Ambil Pemenang Sementara
export async function getWinner() {
  return apiFetch("/results/winner");
}

// --- 5. FITUR IMPORT & DOWNLOAD ---

export async function importStudents(formData: FormData) {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData, 
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Gagal mengimpor data siswa");
  }
  return data;
}

export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

// --- 6. FITUR SETTINGS ---
export async function getSettings() {
  return apiFetch("/settings");
}

export async function updateSettings(data: any) {
  return apiFetch("/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
