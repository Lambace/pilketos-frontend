const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Helper utama untuk memanggil API
 * Menjamin URL tersusun dengan benar dan menangani error response
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
  // 1. Pastikan path dimulai dengan '/'
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // 2. Pastikan API_URL tidak diakhiri dengan '/' untuk menghindari double slash
  const baseUrl = API_URL?.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

  const res = await fetch(`${baseUrl}${cleanPath}`, options);

  // 3. Penanganan jika server mengirim error (400, 401, 404, 500)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Terjadi kesalahan pada server");
  }

  return res.json();
}

/**
 * Fungsi-fungsi API Spesifik
 */

// Login Siswa menggunakan NISN
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// Mengambil daftar kandidat untuk halaman vote & admin
export async function getCandidates() {
  return apiFetch("/candidates");
}

// Menambah kandidat baru (Admin) - Mendukung upload gambar (FormData)
export async function addCandidate(formData: FormData) {
  return apiFetch("/candidates", { 
    method: "POST", 
    body: formData 
    // Note: Jangan set Content-Type header manual jika mengirim FormData
  });
}

// Mengambil hasil perhitungan suara
export async function getResults() {
  return apiFetch("/results");
}

// Mengirimkan pilihan suara siswa
export async function vote(nisn: string, candidateId: number) {
  return apiFetch("/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn, candidate_id: candidateId }),
  });
}

// Mengambil data pemenang (Opsional)
export async function getWinner() {
  return apiFetch("/winner");
}
