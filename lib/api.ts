const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Helper utama untuk memanggil API
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Memastikan tidak ada double slash atau missing slash
  const baseUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

  const res = await fetch(`${baseUrl}${cleanPath}`, options);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Terjadi kesalahan pada server");
  }
  return res.json();
}

/**
 * API KANDIDAT (Ketua OSIS)
 */

// Ambil semua kandidat
export async function getCandidates() {
  return apiFetch("/candidates");
}

// Tambah kandidat baru (FormData untuk Foto)
export async function addCandidate(formData: FormData) {
  return apiFetch("/candidates", { 
    method: "POST", 
    body: formData 
  });
}

// Update kandidat (Fitur tombol EDIT)
export async function updateCandidate(id: number, formData: FormData) {
  return apiFetch(`/candidates/${id}`, {
    method: "PUT",
    body: formData,
  });
}

// Hapus kandidat (Fitur tombol DELETE)
export async function deleteCandidate(id: number) {
  return apiFetch(`/candidates/${id}`, {
    method: "DELETE",
  });
}


/**
 * API SISWA (STUDENTS) - Solusi untuk Data yang Hilang
 */

// Ambil semua daftar siswa/NISN
export async function getStudents() {
  return apiFetch("/students");
}

// Tambah siswa manual satu per satu
export async function addStudent(data: { nisn: string; name: string; tingkat: string; kelas: string }) {
  return apiFetch("/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Hapus siswa
export async function deleteStudent(id: number) {
  return apiFetch(`/students/${id}`, {
    method: "DELETE",
  });
}

// Fitur IMPORT EXCEL (Mengirim array siswa ke backend)
export async function importStudents(students: any[]) {
  return apiFetch("/students/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ students }),
  });
}


/**
 * API VOTING & LOGIN
 */

// Login pakai NISN
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// Kirim vote
export async function vote(nisn: string, candidateId: number) {
  return apiFetch("/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn, candidate_id: candidateId }),
  });
}

// Ambil hasil vote untuk grafik/dashboard
export async function getResults() {
  return apiFetch("/results");
}

// Ambil pemenang
export async function getWinner() {
  return apiFetch("/winner");
}

// Reset seluruh suara (semua siswa bisa memilih lagi)
export const resetAllVotes = () => 
  apiFetch("/votes/reset-all", { method: "DELETE" });

// Reset suara per siswa (siswa tertentu bisa memilih lagi)
export const resetStudentVote = (nisn: string) => 
  apiFetch(`/votes/reset/${nisn}`, { method: "DELETE" });
