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

// --- 2. FITUR VOTING ---
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

// --- 3. FITUR IMPORT EXCEL (MEMPERBAIKI ERROR BARIS 88) ---
// Fungsi ini sekarang menerima 'File' asli dari input browser
export async function importStudents(file: File) {
  const formData = new FormData();
  formData.append("file", file); // 'file' harus sama dengan upload.single('file') di backend

  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    // PENTING: Jangan tambahkan header 'Content-Type' saat mengirim FormData
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Gagal mengimpor data siswa");
  }
  return res.json();
}

// --- 4. FITUR DOWNLOAD FORMAT ---
export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

// --- 5. FITUR SETTINGS (Opsional jika Anda pakai) ---
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
