const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  return apiFetch("/students");
}

// --- 4. FITUR UPDATE SISWA ---
export async function updateStudent(nisn: string, data: { name: string; tingkat: string; kelas: string }) {
  return apiFetch(`/students/${nisn}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// --- 5. FITUR HAPUS SISWA ---
export async function deleteStudent(nisn: string) {
  return apiFetch(`/students/${nisn}`, {
    method: "DELETE",
  });
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
