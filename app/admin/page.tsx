"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getStudents, deleteStudent, updateStudent, importStudents } from "../../lib/api";

export default function AdminPage() {
  // 1. Inisialisasi State
  const [candidates, setCandidates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // State untuk Form Kandidat
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // State untuk Edit Siswa
  const [editingNisn, setEditingNisn] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // 2. Fungsi Ambil Data
  const loadData = async () => {
    try {
      const dataSiswa = await getStudents();
      setStudents(dataSiswa || []); 

      const resKandidat = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`);
      const dataKandidat = await resKandidat.json();
      setCandidates(dataKandidat || []);
    } catch (err) {
      console.error("Gagal load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 3. Fungsi Hapus Siswa
  const handleDeleteStudent = async (nisn: string) => {
    if (!confirm("Hapus siswa ini?")) return;
    try {
      await deleteStudent(nisn);
      alert("✅ Berhasil dihapus");
      loadData(); 
    } catch (err) {
      alert("❌ Gagal menghapus");
    }
  };

  // 4. Fungsi Update Siswa
  const handleUpdateStudent = async (nisn: string) => {
    const newName = prompt("Masukkan Nama Baru:", editName);
    if (!newName) return;
    try {
      await updateStudent(nisn, { name: newName, tingkat: "10", kelas: "A" }); 
      alert("✅ Berhasil diupdate");
      loadData();
    } catch (err) {
      alert("❌ Gagal update");
    }
  };

  // 5. Fungsi Import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMessage("⏳ Sedang mengimport...");
      await importStudents(file);
      setMessage("✅ Import Berhasil!");
      loadData();
    } catch (err: any) {
      // Jika error message adalah "undefined", tampilkan pesan general
      const errorMsg = err.message === "undefined" ? "Terjadi kesalahan sistem" : err.message;
      setMessage("❌ Error: " + errorMsg);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Panel Admin</h1>

      {/* --- BAGIAN PERBAIKAN PESAN UNDEFINED --- */}
      {message && message !== "undefined" && (
        <p style={{ 
          color: message.includes("✅") ? "green" : "red", 
          fontWeight: "bold",
          padding: "10px",
          backgroundColor: message.includes("✅") ? "#eaffea" : "#ffeaea",
          borderRadius: "5px",
          border: `1px solid ${message.includes("✅") ? "green" : "red"}`
        }}>
          {message}
        </p>
      )}

      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", marginTop: "10px" }}>
        <input type="file" onChange={handleImport} id="file-import" hidden />
        <label htmlFor="file-import" style={{ padding: "10px", background: "green", color: "white", cursor: "pointer", borderRadius: "5px" }}>
          📥 Import Excel
        </label>
        <Link href="/hasil-vote" style={{ padding: "10px", background: "blue", color: "white", textDecoration: "none", borderRadius: "5px" }}>
          📊 Hasil Vote
        </Link>
      </div>

      <h2>Daftar Siswa</h2>
      <table border={1} cellPadding={10} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#eee" }}>
            <th>NISN</th>
            <th>Nama</th>
            <th>Kelas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.nisn}>
                <td>{s.nisn}</td>
                <td>{s.name || s.nama || s.Nama || "-"}</td>
                <td>{s.tingkat || ""}-{s.kelas || ""}</td>
                <td>
                  <button onClick={() => { setEditName(s.name || s.nama); handleUpdateStudent(s.nisn); }} style={{ marginRight: "5px" }}>Edit</button>
                  <button onClick={() => handleDeleteStudent(s.nisn)} style={{ color: "red" }}>Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} align="center">Data kosong atau sedang memuat...</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
