const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export async function getStudents() {
  const res = await fetch(`${API_URL}/students`);
  return res.json();
}

export async function addStudent(data: any) {
  const res = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal menyimpan");
  return res.json();
}

export async function getCandidates() {
  const res = await fetch(`${API_URL}/candidates`);
  return res.json();
}

export async function deleteStudent(nisn: string) {
  return fetch(`${API_URL}/students/${nisn}`, { method: "DELETE" });
}
