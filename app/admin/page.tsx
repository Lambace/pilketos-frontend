"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "X", 
    kelas: "",
    nomor_urut: "" 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. FUNGSI LOAD DATA (STABIL)
  const loadData = async () => {
    try {
      const resS = await fetch(`${API_URL}/students`);
      const resC = await fetch(`${API_URL}/candidates`);
      const sData = await resS.json();
      const cData = await resC.json();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error("Gagal load data", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. FUNGSI RESET SEMUA SISWA (TOMBOL BARU)
  const handleResetAllStudents = async () => {
    if (!confirm("⚠️ PERINGATAN KERAS: Hapus seluruh data siswa?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/students`, { method: "DELETE" });
      if (res.ok) {
        alert("✅ Seluruh data siswa telah dibersihkan!");
        loadData();
      }
    } catch (err) {
      alert("❌ Gagal reset data");
    } finally {
      setLoading(false);
    }
  };

  // 3. FUNGSI SIMPAN SISWA (MANUAL)
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const method = view === "edit-siswa" ? "PUT" : "POST";
    const url = view === "edit-siswa" ? `${API_URL}/students/${formData.nisn}` : `${API_URL}/students`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("✅ Data berhasil disimpan");
        setView("input-nisn");
        loadData();
      }
    } catch (err) {
      alert("❌ Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  // 4. FUNGSI HAPUS SATU SISWA
  const handleDeleteStudent = async (nisn: string) => {
    if (!confirm("Hapus siswa ini?")) return;
    try {
      await fetch(`${API_URL}/students/${nisn}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      alert("Gagal hapus");
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button type="button" onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button type="button" onClick={() => setView("input-nisn")} className={view.includes("nisn") ? styles.active : ""}>👤 Data Siswa</button>
          <button type="button" onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Data Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className={styles.mainContent}>
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
                {/* TOMBOL RESET DI SINI */}
                <button type="button" onClick={handleResetAllStudents} className={styles.btnReset}>🗑️ Reset Semua</button>
                <button type="button" onClick={() => { setFormData({nisn:"", name:"", tingkat:"X", kelas:"", nomor_urut:""}); setView("form-manual-nisn"); }} className={styles.btnManual}>➕ Input Manual</button>
                <button type="button" onClick={() => window.open(`${API_URL}/students/download-format`)} className={styles.btnExcel}>📥 Format Excel</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if(file) {
                     const fd = new FormData(); fd.append("file", file);
                     await fetch(`${API_URL}/students/import`, { method: "POST", body: fd });
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
                {students.map((s) => (
                  <tr key={s.nisn}>
                    <td>{s.nisn}</td>
                    <td>{s.name || s.nama}</td>
                    <td>
                      <button type="button" onClick={() => { setFormData({...s}); setView("edit-siswa"); }} className={styles.btnEdit}>Edit</button>
                      <button type="button" onClick={() => handleDeleteStudent(s.nisn)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {(view === "form-manual-nisn" || view === "edit-siswa") && (
          <section className={styles.formContainer}>
            <h2>{view === "edit-siswa" ? "Edit" : "Tambah"} Siswa</h2>
            <form onSubmit={handleSaveStudent}>
              <div className={styles.inputField}>
                <label>NISN</label>
                <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} disabled={view === "edit-siswa"} required />
              </div>
              <div className={styles.inputField}>
                <label>Nama</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className={styles.buttonGroupLarge}>
                <button type="submit" disabled={loading} className={styles.btnSave}>{loading ? "Memproses..." : "Simpan"}</button>
                <button type="button" onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
