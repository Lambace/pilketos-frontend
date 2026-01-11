// Menggunakan fallback string kosong agar tidak crash jika env belum diatur
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

/**
 * Helper fetch dengan error handling standar
 */
async function apiFetch(endpoint: string, options: any = {}) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const res = await fetch(`${API_URL}${cleanEndpoint}`, {
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || `Error ${res.status}`);
  }
  return res.json();
}

// --- AUTH ---
export async function login(nisn: string) {
  return apiFetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
}

// --- SISWA ---
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
  return apiFetch("/students/import", { method: "POST", body: formData });
}

export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

export async function resetAllStudents() {
  return apiFetch("/students/reset", { method: "DELETE" });
}

// --- KANDIDAT ---
export async function getCandidates() {
  return apiFetch("/candidates");
}

export async function addCandidate(formData: FormData) {
  return apiFetch("/candidates", { method: "POST", body: formData });
}

export async function updateCandidate(id: string | number, formData: FormData) {
  return apiFetch(`/candidates/${id}`, { method: "PUT", body: formData });
}

export async function deleteCandidate(id: string | number) {
  return apiFetch(`/candidates/${id}`, { method: "DELETE" });
}

export async function resetAllCandidates() {
  return apiFetch("/candidates/reset", { method: "DELETE" });
}

// --- VOTING ---
export async function submitVote(nisn: string, candidate_id: number) {
  return apiFetch("/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn, candidate_id }),
  });
} // <--- Tadi Kurang Kurung Tutup di sini

export async function resetAllVotes() {
  return apiFetch("/votes/reset", { method: "DELETE" });
}

// --- SETTINGS ---
export async function getSettings() {
  return apiFetch("/settings");
}

export async function updateSettings(data: FormData | any) {
  const isFormData = data instanceof FormData;
  return apiFetch("/settings", {
    method: "PUT",
    body: isFormData ? data : JSON.stringify(data),
    headers: isFormData ? {} : { "Content-Type": "application/json" },
  });
}
