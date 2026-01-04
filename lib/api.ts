const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://voting-backend-production-ea29.up.railway.app";
// 1. Fungsi Login (Wajib ada supaya Vercel tidak error)
export async function login(nisn: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nisn }),
  });
  if (!res.ok) throw new Error("NISN tidak terdaftar atau salah");
  return res.json();
}

// 2. Fungsi Input Siswa (URL bersih tanpa teks sampah)
export async function addStudent(data: any) {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menyimpan siswa");
  return res.json();
}

// 3. Fungsi Pendukung Lainnya (Wajib di-export agar admin page jalan)
export async function getStudents() {
  const res = await fetch(`${API_URL}/students`);
  return res.json();
}

export async function deleteStudent(nisn: string) {
  return fetch(`${API_URL}/students/${nisn}`, { method: "DELETE" });
}

export async function getCandidates() {
  const res = await fetch(`${API_URL}/candidates`);
  return res.json();
}

export async function updateStudent(nisn: string, data: any) {
  const res = await fetch(`${API_URL}/students/${nisn}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function importStudents(formData: FormData) {
  const res = await fetch(`${API_URL}/students/import`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function downloadStudentFormat() {
  window.location.href = `${API_URL}/students/download-format`;
}

// Tambahkan fungsi kandidat agar tidak error saat diimpor di admin
export async function addCandidate(formData: FormData) { return { }; }
export async function updateCandidate(id: any, formData: FormData) { return { }; }
export async function deleteCandidate(id: any) { return { }; }
