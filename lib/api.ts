const API_URL = "https://voting-backend-production-ea29.up.railway.app";

// Helper untuk fetch dasar
async function apiFetch(endpoint: string, options: any = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Terjadi kesalahan pada server");
  }
  return res.json();
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

// --- 3. FITUR SISWA (AMBIL SEMUA) ---
export async function getStudents() {
  try {
    const res = await fetch(`${API_URL}/students`);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return []; // Kembalikan array kosong agar tidak undefined
  }
}
// --- 4. FITUR UPDATE SISWA ---
export async function updateStudent(nisn: string, data: any) {
  // GANTI process.env MENJADI API_URL
  const res = await fetch(`${API_URL}/students/${nisn}`, { 
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal update data");
  return res.json();
}

// --- 5. FITUR HAPUS SISWA ---
export async function deleteStudent(nisn: string) {
  // GANTI process.env MENJADI API_URL
  const res = await fetch(`${API_URL}/students/${nisn}`, { 
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus data");
  return res.json();
}
// --- 6. FITUR IMPORT EXCEL ---
export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData, // Browser otomatis set boundary
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal mengimpor data siswa");
  }
  return res.json();
}

// --- 7. FITUR DOWNLOAD FORMAT ---
export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

// --- 8. FITUR SETTINGS ---
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
