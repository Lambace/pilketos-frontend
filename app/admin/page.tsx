"use client";
import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import Link from "next/link";
import { getStudents, deleteStudent, updateStudent, importStudents } from "../../lib/api";

export default function AdminPage() {
  // --- STATE DATA ---
  const [candidates, setCandidates] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // --- STATE FORM KANDIDAT ---
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // --- STATE EDIT SISWA ---
  const [editingNisn, setEditingNisn] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", tingkat: "", kelas: "" });

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    try {
      const [dataCandidates, dataStudents] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`).then(res => res.json()),
        getStudents()
      ]);
      setCandidates(dataCandidates);
      setStudents(dataStudents);
    } catch (err) {
      setMessage("⚠️ Gagal memuat data dari server.");
    }
  };

  // ✅ HANDLER SISWA
  const handleDeleteStudent = async (nisn: string) => {
    if (confirm("Hapus siswa ini?")) {
      try {
        await deleteStudent(nisn);
        setStudents(prev => prev.filter(s => s.nisn !== nisn));
        alert("✅ Siswa berhasil dihapus");
      } catch (err) {
        alert("❌ Gagal menghapus");
      }
    }
  };

  const startEditStudent = (s: any) => {
    setEditingNisn(s.nisn);
    setEditData({ 
      name: s.name || s.nama || "", 
      tingkat: s.tingkat || "", 
      kelas: s.kelas || "" 
    });
  };

  const handleUpdateStudent = async () => {
    if (!editingNisn) return;
    try {
      await updateStudent(editingNisn, editData);
      alert("✅ Data diperbarui");
      setEditingNisn(null);
      refreshAllData();
    } catch (err) {
      alert("❌ Gagal update");
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMessage("⏳ Mengimpor...");
      await importStudents(file);
      setMessage("✅ Import berhasil!");
      refreshAllData();
    } catch (err: any) {
      setMessage("❌ " + err.message);
    }
  };

  // ✅ HANDLER KANDIDAT
  const handleAddCandidate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("vision", vision);
      formData.append("mission", mission);
      if (photo) formData.append("photo", photo);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("✅ Kandidat berhasil ditambahkan");
        setName(""); setVision(""); setMission(""); setPhoto(null);
        refreshAllData();
      }
    } catch (err) {
      setMessage("⚠️ Gagal tambah kandidat.");
    }
  };

  return (
    <div className={styles.container}>
      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.buttonGroup}>
        <Link href="/hasil-vote" className={styles.adminCard}>
          <div className={styles.icon}>📊</div>
          <div className={styles.text}>Hasil Voting</div>
        </Link>
        <div className={styles.adminCard}>
          <div className={styles.icon}>📥</div>
          <input type="file" onChange={handleImportFile} id="importExcel" hidden />
          <label htmlFor="importExcel" style={{cursor: 'pointer'}} className={styles.text}>Import Excel</label>
        </div>
      </div>

      {/* --- FORM EDIT SISWA (MUNCUL JIKA TOMBOL EDIT DIKLIK) --- */}
      {editingNisn && (
        <div className={styles.form} style={{border: '2px solid gold', padding: '15px'}}>
          <h3>Edit Siswa: {editingNisn}</h3>
          <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Nama" />
          <input type="text" value={editData.tingkat} onChange={e => setEditData({...editData, tingkat: e.target.value})} placeholder="Tingkat" />
          <input type="text" value={editData.kelas} onChange={e => setEditData({...editData, kelas: e.target.value})} placeholder="Kelas" />
          <button onClick={handleUpdateStudent}>Simpan Perubahan</button>
          <button onClick={() => setEditingNisn(null)} style={{backgroundColor: 'gray'}}>Batal</button>
        </div>
      )}

      {/* --- TABEL SISWA --- */}
      <h2>Daftar Siswa</h2>
      <table className={styles.table}>
        <thead>
          <tr><th>NISN</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((s) => (
              <tr key={s.nisn}>
                <td>{s.nisn}</td>
                <td>{s.name || s.nama || "-"}</td>
                <td>{s.tingkat}-{s.kelas}</td>
                <td>
                  <button onClick={() => startEditStudent(s)} className={styles.btnEdit}>Edit</button>
                  <button onClick={() => handleDeleteStudent(s.nisn)} className={styles.btnDelete}>Hapus</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} style={{textAlign: 'center'}}>Data Kosong</td></tr>
          )}
        </tbody>
      </table>

      {/* --- FORM TAMBAH KANDIDAT --- */}
      <h2>Tambah Kandidat</h2>
      <div className={styles.form}>
        <input type="text" placeholder="Nama Kandidat" value={name} onChange={e => setName(e.target.value)} />
        <textarea placeholder="Visi" value={vision} onChange={e => setVision(e.target.value)} />
        <textarea placeholder="Misi" value={mission} onChange={e => setMission(e.target.value)} />
        <input type="file" onChange={e => setPhoto(e.target.files?.[0] || null)} />
        <button onClick={handleAddCandidate}>Simpan Kandidat</button>
      </div>
    </div>
  );
}
