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

// 5. UPDATE DATA SISWA
app.put('/students/:nisn', async (req, res) => {
  const { nisn } = req.params;
  const { name, tingkat, kelas } = req.body;
  try {
    const result = await pool.query(
      'UPDATE students SET name = $1, tingkat = $2, kelas = $3 WHERE nisn = $4 RETURNING *',
      [name, tingkat, kelas, nisn]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json({ success: true, message: "Data siswa berhasil diupdate", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Gagal update data" });
  }
});

// 6. HAPUS DATA SISWA
app.delete('/students/:nisn', async (req, res) => {
  const { nisn } = req.params;
  try {
    const result = await pool.query('DELETE FROM students WHERE nisn = $1 RETURNING *', [nisn]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
    res.json({ success: true, message: "Siswa berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus data" });
  }
});

// HAPUS SEMUA SISWA (Opsional - untuk reset data)
app.delete('/students-all', async (req, res) => {
  try {
    await pool.query('DELETE FROM students');
    res.json({ success: true, message: "Semua data siswa berhasil dikosongkan" });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengosongkan data" });
  }
});

// --- 7. FITUR SETTINGS (Opsional jika Anda pakai) ---
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
