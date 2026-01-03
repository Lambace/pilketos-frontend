"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
// Hubungkan dengan lib/api yang memanggil route Express Anda
import { getStudents, deleteStudent, getCandidates, addStudent, resetStudents, importStudents } from "../../lib/api";

type View = "dashboard" | "input-nisn" | "input-kandidat" | "form-manual-nisn";

export default function AdminPage() {
  const [view, setView] = useState<View>("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nisn: "", name: "", tingkat: "-", kelas: "-" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const sData = await getStudents();
      const cData = await getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) { console.error("Gagal memuat data:", err); }
  };

  useEffect(() => { loadData(); }, []);

  // ✅ 1. DOWNLOAD FORMAT (student-format.xlsx dari backend)
  const handleDownloadFormat = () => {
    // Pastikan URL mengarah ke port backend Anda (contoh: localhost:5000)
    window.location.href = "http://localhost:5000/api/students/download-format";
    alert("📥 Mengunduh format student-format.xlsx...");
  };

  // ✅ 2. IMPORT EXCEL
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      alert("⏳ Sedang mengimpor data...");
      await importStudents(data);
      alert("✅ Berhasil mengimpor data!");
      loadData();
    } catch (err) { alert("❌ Gagal mengimpor data."); }
  };

  // ✅ 3. RESET SEMUA DATA
  const handleResetData = async () => {
    if (confirm("⚠️ PERINGATAN! Semua data siswa akan dihapus permanen. Lanjutkan?")) {
      try {
        await resetStudents();
        alert("🗑️ Data berhasil direset!");
        loadData();
      } catch (err) { alert("❌ Gagal mereset data."); }
    }
  };

  // ✅ 4. SIMPAN MANUAL
  const handleSaveManual = async () => {
    if (!formData.nisn || !formData.name) return alert("⚠️ NISN dan Nama wajib diisi!");
    try {
      await addStudent(formData); // Mengirim object {nisn, name, tingkat, kelas}
      alert("✅ Siswa berhasil ditambahkan!");
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-" });
      loadData();
      setView("input-nisn");
    } catch (err) { alert("❌ Gagal menyimpan."); }
  };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn")} className={view === "input-nisn" || view === "form-manual-nisn" ? styles.active : ""}>👤 Input NISN</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Input Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className={styles.mainContent}>
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator 👋</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Siswa (DPT)</h3><p>{students.length}</p></div>
              <div className={styles.statCard}><h3>Kandidat</h3><p>{candidates.length}</p></div>
            </div>
            <div className={styles.infoBox}>
              <h3>Selamat Datang!</h3>
              <p>Gunakan sidebar untuk mengelola data pemilihan. Sistem saat ini berstatus <strong>Aktif</strong>.</p>
            </div>
          </div>
        )}

        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Input Manual</button>
                <button onClick={handleDownloadFormat} className={styles.btnExcel}>📥 Download Format</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display:'none'}} accept=".xlsx,.xls" />
                <button onClick={() => fileInputRef.current?.click()} className={styles.btnImport}>📤 Import Excel</button>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr><th>NISN</th><th>Nama</th><th>Kelas</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nisn}</td>
                    <td>{s.name}</td>
                    <td>{s.tingkat} {s.kelas}</td>
                    <td className={styles.tableActions}>
                      <button className={styles.btnEdit}>Edit</button>
                      <button onClick={() => deleteStudent(s.id).then(loadData)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleResetData} className={styles.btnReset}>⚠️ Hapus Semua Data Siswa</button>
          </section>
        )}

        {view === "form-manual-nisn" && (
          <section className={styles.formContainer}>
            <h2>Tambah Siswa Manual</h2>
            <div className={styles.inputField}><label>NISN</label>
              <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} />
            </div>
            <div className={styles.inputField}><label>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button className={styles.btnSave} onClick={handleSaveManual}>Simpan</button>
              <button className={styles.btnCancel} onClick={() => setView("input-nisn")}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
