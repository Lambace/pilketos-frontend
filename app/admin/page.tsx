"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
// Pastikan fungsi-fungsi ini sudah ada di file lib/api Anda
import { getStudents, deleteStudent, getCandidates, addStudent } from "../../lib/api";

type View = "dashboard" | "input-nisn" | "input-kandidat" | "form-manual-nisn";

export default function AdminPage() {
  const [view, setView] = useState<View>("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // State untuk menangkap input dari form
  const [formData, setFormData] = useState({ nisn: "", nama: "" });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const sData = await getStudents();
      const cData = await getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error("Gagal load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- FUNGSI INPUT MANUAL (DENGAN RESPON) ---
  const handleSaveManual = async () => {
    if (!formData.nisn || !formData.nama) {
      alert("⚠️ Harap isi NISN dan Nama!");
      return;
    }

    try {
      // Memanggil fungsi API untuk simpan ke database
      await addStudent(formData.nisn, formData.nama); 
      
      alert("✅ Data Berhasil Disimpan ke Database!");
      setFormData({ nisn: "", nama: "" }); // Kosongkan form
      await loadData(); // Refresh tabel agar data baru muncul
      setView("input-nisn"); // Kembali ke tabel
    } catch (error) {
      alert("❌ Gagal menyimpan data. Silahkan coba lagi.");
      console.error(error);
    }
  };

  // --- FUNGSI HAPUS (DENGAN RESPON) ---
  const handleDelete = async (nisn: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await deleteStudent(nisn);
        alert("🗑️ Data Berhasil Dihapus!");
        loadData(); // Refresh tabel
      } catch (err) {
        alert("❌ Gagal menghapus data.");
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
          <button onClick={() => setView("input-nisn")} className={view === "input-nisn" || view === "form-manual-nisn" ? styles.active : ""}>👤 Input NISN</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Input Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
             <div className={styles.welcomeText}>
              <h1>Selamat Datang kembali, Admin! 👋</h1>
              <p>Kelola data pemilih dan kandidat SMK2 Kolaka dengan mudah.</p>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Total Pemilih</h3><p>{students.length}</p></div>
              <div className={styles.statCard}><h3>Total Kandidat</h3><p>{candidates.length}</p></div>
            </div>
          </div>
        )}

        {/* TABEL NISN VIEW */}
        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Daftar Siswa (DPT)</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Input Manual</button>
                <button onClick={() => alert("Fitur Export Excel segera aktif")} className={styles.btnExcel}>📥 Download Excel</button>
                <button onClick={() => alert("Silahkan pilih file Excel")} className={styles.btnImport}>📤 Import Data</button>
              </div>
            </div>

            {loading ? <p>Memuat data...</p> : (
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
                        <button className={styles.btnEdit} onClick={() => alert("Edit NISN: " + s.nisn)}>Edit</button>
                        <button onClick={() => handleDelete(s.nisn)} className={styles.btnDelete}>Hapus</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className={styles.empty}>Data tidak ditemukan / Kosong</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* FORM INPUT MANUAL VIEW */}
        {view === "form-manual-nisn" && (
          <section className={styles.formContainer}>
            <h2>Tambah Siswa Baru</h2>
            <div className={styles.inputField}>
              <label>NISN</label>
              <input 
                type="text" 
                value={formData.nisn}
                onChange={(e) => setFormData({...formData, nisn: e.target.value})}
                placeholder="Contoh: 00812345" 
              />
            </div>
            <div className={styles.inputField}>
              <label>Nama Siswa</label>
              <input 
                type="text" 
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                placeholder="Nama Lengkap" 
              />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button className={styles.btnSave} onClick={handleSaveManual}>Simpan Ke Database</button>
              <button className={styles.btnCancel} onClick={() => setView("input-nisn")}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
