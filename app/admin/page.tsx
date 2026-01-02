"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getStudents, deleteStudent, updateStudent, importStudents } from "../../lib/api";

export default function AdminPage() {
  const [students, setStudents] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const data = await getStudents();
      // Paksa jadi array kosong jika data yang datang rusak/null
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Koneksi gagal");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (nisn: string) => {
    if (!confirm("Hapus siswa ini?")) return;
    try {
      await deleteStudent(nisn);
      alert("✅ Berhasil dihapus");
      loadData();
    } catch (err) {
      alert("❌ Gagal menghapus");
    }
  };

  const handleUpdate = async (nisn: string, oldName: string) => {
    const newName = prompt("Nama Baru:", oldName);
    if (!newName) return;
    try {
      await updateStudent(nisn, { name: newName, tingkat: "10", kelas: "A" });
      alert("✅ Berhasil diupdate");
      loadData();
    } catch (err) {
      alert("❌ Gagal update");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel Admin</h1>
      
      {/* Tombol Navigasi */}
      <div style={{ marginBottom: "20px" }}>
        <Link href="/hasil-vote" style={{ padding: "10px", background: "blue", color: "white", textDecoration: "none" }}>
          📊 Hasil Vote
        </Link>
      </div>

      <table border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.nisn}>
                <td>{s.nisn}</td>
                {/* Cari property name, nama, atau Nama */}
                <td>{s.name || s.nama || s.Nama || "-"}</td>
                <td>
                  <button onClick={() => handleUpdate(s.nisn, s.name || s.nama)}>Edit</button>
                  <button onClick={() => handleDelete(s.nisn)} style={{ color: "red" }}>Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={3} align="center">Data tidak ditemukan / Kosong</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
