"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { getStudents, deleteStudent, getCandidates } from "../../lib/api";

type View = "dashboard" | "input-nisn" | "input-kandidat" | "form-manual-nisn";

export default function AdminPage() {
  const [view, setView] = useState<View>("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // State untuk form manual
  const [formData, setFormData] = useState({ nisn: "", nama: "" });

  const loadData = async () => {
    const sData = await getStudents();
    const cData = await getCandidates();
    setStudents(Array.isArray(sData) ? sData : []);
    setCandidates(Array.isArray(cData) ? cData : []);
  };

  useEffect(() => { loadData(); }, []);

  // 1. Fungsi Simpan Manual
  const handleSaveManual = () => {
    if (!formData.nisn || !formData.nama) {
      alert("❌ Gagal: NISN dan Nama tidak boleh kosong!");
      return;
    }
    
    // Simulasi simpan ke state (Nanti ganti dengan panggil API simpan)
    const newStudent = { nisn: formData.nisn, nama: formData.nama };
    setStudents([...students, newStudent]);
    
    alert("✅ Berhasil: Data siswa telah ditambahkan.");
    setFormData({ nisn: "", nama: "" }); // Reset form
    setView("input-nisn"); // Kembali ke tabel
  };

  // 2. Fungsi Hapus dengan Konfirmasi
  const handleDelete = async (nisn: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteStudent(nisn);
        setStudents(students.filter(s => s.nisn !== nisn));
        alert("🗑️ Berhasil: Data telah dihapus.");
      } catch (err) {
        alert("❌ Gagal: Tidak dapat menghapus data.");
      }
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn") || setView("form-manual-nisn")} className={view === "input-nisn" || view === "form-manual-nisn" ? styles.active : ""}>👤 Input NISN</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Input Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Selamat Datang kembali, Admin! 👋</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Pemilih</h3><p>{students.length}</p></div>
              <div className={styles.statCard}><h3>Kandidat</h3><p>{candidates.length}</p></div>
            </div>
          </div>
        )}

        {/* HALAMAN TABEL NISN */}
        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Manajemen Data NISN</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Input Manual</button>
                <button onClick={() => alert("💾 Mengunduh Format Excel...")} className={styles.btnExcel}>📥 Download Excel</button>
                <button onClick={() => alert("📂 Silahkan pilih file Excel Anda.")} className={styles.btnImport}>📤 Import Data</button>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr><th>NISN</th><th>Nama</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((s) => (
                  <tr key={s.nisn}>
                    <td>{s.nisn}</td>
                    <td>{s.nama || s.name}</td>
                    <td className={styles.tableActions}>
                      <button onClick={() => alert("Fitur Edit segera datang!")} className={styles.btnEdit}>Edit</button>
                      <button onClick={() => handleDelete(s.nisn)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className={styles.empty}>Data Kosong</td></tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* FORM MANUAL */}
        {view === "form-manual-nisn" && (
          <section className={styles.formContainer}>
            <h2>Tambah Siswa Manual</h2>
            <div className={styles.inputField}>
              <label>NISN</label>
              <input 
                type="text" 
                value={formData.nisn}
                onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                placeholder="Masukkan 10 digit NISN..." 
              />
            </div>
            <div className={styles.inputField}>
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                placeholder="Masukkan Nama Lengkap..." 
              />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button className={styles.btnSave} onClick={handleSaveManual}>Simpan Data</button>
              <button className={styles.btnCancel} onClick={() => setView("input-nisn")}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
