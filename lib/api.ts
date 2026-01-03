const API_URL = "https://voting-backend-production-ea29.up.railway.app"; 
// Note: Pastikan di backend route-nya diawali /api atau sesuaikan di sini

async function apiFetch(endpoint: string, options: any = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan pada server");
  }
  return res.json();
}

// --- 1. LOGIN ---
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// --- 2. KANDIDAT & VOTING ---
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

// --- 3. MANAJEMEN SISWA (CRUD) ---

export async function getStudents() {
  return apiFetch("/students");
}

// Tambah Siswa Manual (Sesuai kolom backend: nisn, name, tingkat, kelas)
export async function addStudent(data: { nisn: string; name: string; tingkat: string; kelas: string }) {
  return apiFetch("/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Update Siswa (Backend menggunakan ID primary key)
export async function updateStudent(nisn: string, data: any) {
  return apiFetch(`/students/${id}`, { 
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Hapus Siswa (Backend menggunakan ID primary key)
export async function deleteStudent(nisn: string) {
  return apiFetch(`/students/${id}`, { 
    method: "DELETE",
  });
}

// Reset Semua Siswa
export async function resetStudents() {
  return apiFetch("/students", {
    method: "DELETE",
  });
}

// --- 4. IMPORT & DOWNLOAD ---

export async function importStudents(formData: FormData) {
  // Langsung gunakan FormData dari parameter agar fleksibel
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData, 
  });

  if (!res.ok) throw new Error("Gagal mengimpor data siswa");
  return res.json();
}

export async function downloadStudentFormat() {
  // Mengarah langsung ke endpoint download-format di backend
  window.location.href = `${API_URL}/students/download-format`;
}

// --- 5. SETTINGS ---
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
