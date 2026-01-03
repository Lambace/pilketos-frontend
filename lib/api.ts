const API_URL = "https://voting-backend-production-ea29.up.railway.app";

// Helper untuk fetch dasar dengan penanganan error yang lebih detail
async function apiFetch(endpoint: string, options: any = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  
  // Ambil data respon (baik sukses maupun gagal)
  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    // Jika ada pesan error dari backend, gunakan itu, jika tidak gunakan default
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

// --- 3. MANAJEMEN SISWA (CRUD) ---

export async function getStudents() {
  try {
    return await apiFetch("/students");
  } catch (err) {
    console.error("Gagal mengambil siswa:", err);
    return [];
  }
}

// ✅ Tambah Siswa Manual (Menghubungkan ke POST /students di backend)
export async function addStudent(data: { nisn: string; name: string; tingkat: string; kelas: string }) {
  return apiFetch("/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ✅ Update Siswa (Menggunakan NISN sesuai route backend: PUT /students/:nisn)
export async function updateStudent(nisn: string, data: any) {
  return apiFetch(`/students/${nisn}`, { 
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ✅ Hapus Siswa (Menggunakan NISN sesuai route backend: DELETE /students/:nisn)
export async function deleteStudent(nisn: string) {
  return apiFetch(`/students/${nisn}`, { 
    method: "DELETE",
  });
}

// ✅ Reset Semua Siswa (Menghubungkan ke rute DELETE baru untuk reset)
export async function resetStudents() {
  return apiFetch("/students-reset-all", {
    method: "DELETE",
  });
}

// --- 4. FITUR IMPORT & DOWNLOAD ---

// ✅ Import Excel
export async function importStudents(formData: FormData) {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData, // Jangan set header Content-Type agar browser otomatis set boundary
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Gagal mengimpor data siswa");
  }
  return data;
}

// ✅ Download Format (Mengarah langsung ke endpoint download-format di backend)
export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

// Fungsi untuk menambah ke tabel candidates
export async function addCandidate(data: any) {
  return apiFetch("/candidates", { // Rute API tetap ke /candidates
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteCandidate(id: number) {
  return apiFetch(`/candidates/${id}`, {
    method: "DELETE",
  });
}

// --- 5. FITUR SETTINGS ---
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
