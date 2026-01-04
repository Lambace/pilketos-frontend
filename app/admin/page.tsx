"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
// Impor langsung dengan pengecekan
import * as api from "../../lib/api";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isEditingKandidat, setIsEditingKandidat] = useState(false);
  const [currentKandidatId, setCurrentKandidatId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "-", 
    kelas: "-",
    image_url: "",
    nomor_urut: "" 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi Load Data yang lebih aman
  const loadData = async () => {
    setLoading(true);
    try {
      const sData = await api.getStudents();
      const cData = await api.getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
      console.log("Data loaded:", { students: sData, candidates: cData });
    } catch (err) { 
      console.error("Gagal memuat data:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Handler Hapus Siswa
  const handleDeleteSiswa = async (nisn: string) => {
    if (!confirm("Hapus siswa ini?")) return;
    try {
      await api.deleteStudent(nisn);
      alert("✅ Terhapus");
      loadData();
    } catch (err) {
      console.error(err);
      alert("❌ Gagal menghapus");
    }
  };

  // Handler Simpan Siswa
  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (view === "edit-siswa") {
        await api.updateStudent(formData.nisn, formData);
        alert("✅ Update Berhasil");
      } else {
        await api.addStudent(formData);
        alert("✅ Simpan Berhasil");
      }
      setView("input-nisn");
      loadData();
    } catch (err) {
      alert("❌ Gagal menyimpan siswa");
    }
  };

  // Handler Reset Semua Siswa
  const handleResetSiswa = async () => {
    if (!confirm("⚠️ Hapus SELURUH data siswa?")) return;
    try {
      await api.resetStudents();
      alert("✅ Data dibersihkan");
      loadData();
    } catch (err) {
      alert("❌ Gagal reset");
    }
  };

  // Handler Hapus Kandidat
  const handleDeleteKandidat = async (id: number) => {
    if (!confirm("Hapus kandidat?")) return;
    try {
      await api.deleteCandidate(id);
      loadData();
    } catch (err) {
      alert("Gagal hapus kandidat");
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button type="button" onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button type="button" onClick={() => setView("input-nisn")} className={view.includes("nisn") || view === "edit-siswa" ? styles.active : ""}>👤 Data Siswa</button>
          <button type="button" onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Data Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
        {loading && <p style={{color: 'blue'}}>⌛ Memproses data...</p>}

        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator 👋</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Total Siswa</h3><p className={styles.statNumber}>{students.length}</p></div>
              <div className={styles.statCard}><h3>Total Kandidat</h3><p className={styles.statNumber}>{candidates.length}</p></div>
            </div>
          </div>
        )}

        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button type="button" onClick={handleResetSiswa} className={styles.btnReset}>🗑️ Reset Semua</button>
                <button type="button" onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Input Manual</button>
                <button type="button" onClick={() => api.downloadStudentFormat()} className={styles.btnExcel}>📥 Format Excel</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                    const fd = new FormData(); fd.append("file", file);
                    await api.importStudents(fd);
                    alert("Import Berhasil");
                    loadData();
                  }
                }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.btnImport}>📤 Import Excel</button>
              </div>
            </div>
            <table className={styles.table}>
              <thead>
                <tr><th>NISN</th><th>Nama</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.nisn || idx}>
                    <td>{s.nisn}</td>
                    <td>{s.name || s.nama}</td>
                    <td>
                      <button type="button" onClick={() => { setFormData({...s, name: s.name || s.nama}); setView("edit-siswa"); }} className={styles.btnEdit}>Edit</button>
                      <button type="button" onClick={() => handleDeleteSiswa(s.nisn)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* FORM SISWA (TAMBAH/EDIT) */}
        {(view === "form-manual-nisn" || view === "edit-siswa") && (
          <section className={styles.formContainer}>
            <h2>{view === "edit-siswa" ? "Edit" : "Tambah"} Siswa</h2>
            <form onSubmit={handleSaveSiswa}>
              <div className={styles.inputField}>
                <label>NISN</label>
                <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} disabled={view === "edit-siswa"} required />
              </div>
              <div className={styles.inputField}>
                <label>Nama</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className={styles.buttonGroupLarge}>
                <button type="submit" className={styles.btnSave}>Simpan</button>
                <button type="button" onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
              </div>
            </form>
          </section>
        )}

        {/* VIEW KANDIDAT TETAP ADA DI SINI SEPERTI KODE ANDA SEBELUMNYA */}
      </main>
    </div>
  );
}
