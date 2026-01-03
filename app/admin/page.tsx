"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { getStudents, deleteStudent, getCandidates } from "../../lib/api";

// Definisikan tipe halaman yang tersedia
type View = "dashboard" | "input-nisn" | "input-kandidat" | "form-manual-nisn";

export default function AdminPage() {
  const [view, setView] = useState<View>("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);

  const loadData = async () => {
    const sData = await getStudents();
    const cData = await getCandidates();
    setStudents(Array.isArray(sData) ? sData : []);
    setCandidates(Array.isArray(cData) ? cData : []);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button 
            onClick={() => setView("dashboard")} 
            className={view === "dashboard" ? styles.active : ""}
          >
            🏠 Dashboard
          </button>
          <button 
            onClick={() => setView("input-nisn")} 
            className={view === "input-nisn" || view === "form-manual-nisn" ? styles.active : ""}
          >
            👤 Input NISN
          </button>
          <button 
            onClick={() => setView("input-kandidat")} 
            className={view === "input-kandidat" ? styles.active : ""}
          >
            🗳️ Input Kandidat
          </button>
          <Link href="/hasil-vote" className={styles.navLink}>
            📊 Hasil Vote
          </Link>
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className={styles.mainContent}>
        
        {/* VIEW: DASHBOARD (TEKS SAMBUTAN) */}
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeText}>
              <h1>Selamat Datang kembali, Admin! 👋</h1>
              <p>Ini adalah pusat kendali sistem E-Voting SMK2 Kolaka. Pantau progres dan kelola data pemilih dengan mudah di sini.</p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Pemilih</h3>
                <p className={styles.statNumber}>{students.length}</p>
                <span>Siswa terdaftar</span>
              </div>
              <div className={styles.statCard}>
                <h3>Total Kandidat</h3>
                <p className={styles.statNumber}>{candidates.length}</p>
                <span>Calon ketua & wakil</span>
              </div>
              <div className={styles.statCard}>
                <h3>Status Sistem</h3>
                <p className={styles.statStatus}>Aktif</p>
                <span>Siap menerima suara</span>
              </div>
            </div>

            <div className={styles.infoBox}>
              <h3>Petunjuk Cepat:</h3>
              <ul>
                <li>Gunakan menu <strong>Input NISN</strong> untuk mengelola daftar pemilih.</li>
                <li>Gunakan menu <strong>Input Kandidat</strong> untuk mengatur profil calon.</li>
                <li>Klik <strong>Hasil Vote</strong> untuk melihat perolehan suara real-time.</li>
              </ul>
            </div>
          </div>
        )}

        {/* VIEW: INPUT NISN */}
        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Manajemen Data NISN</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Input Manual</button>
                <button className={styles.btnExcel}>📥 Download Excel</button>
                <button className={styles.btnImport}>📤 Import Data</button>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>NISN</th>
                  <th>Nama</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((s) => (
                  <tr key={s.nisn}>
                    <td>{s.nisn}</td>
                    <td>{s.nama || s.name}</td>
                    <td className={styles.tableActions}>
                      <button className={styles.btnEdit}>Edit</button>
                      <button onClick={() => deleteStudent(s.nisn).then(loadData)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className={styles.empty}>Data Kosong</td></tr>
                )}
              </tbody>
            </table>
            <button onClick={() => confirm("Reset data?")} className={styles.btnReset}>⚠️ Reset Semua Data Siswa</button>
          </section>
        )}

        {/* VIEW: FORM MANUAL NISN */}
        {view === "form-manual-nisn" && (
          <section className={styles.formContainer}>
            <h2>Tambah Siswa Manual</h2>
            <div className={styles.inputField}>
              <label>NISN</label>
              <input type="text" placeholder="Masukkan NISN..." />
            </div>
            <div className={styles.inputField}>
              <label>Nama Lengkap</label>
              <input type="text" placeholder="Masukkan Nama..." />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button className={styles.btnSave} onClick={() => setView("input-nisn")}>Simpan</button>
              <button className={styles.btnCancel} onClick={() => setView("input-nisn")}>Batal</button>
            </div>
          </section>
        )}

        {/* VIEW: INPUT KANDIDAT */}
        {view === "input-kandidat" && (
          <section>
            <h1>Data Kandidat</h1>
            <div className={styles.candidateGrid}>
              {candidates.length > 0 ? candidates.map((c) => (
                <div key={c.id} className={styles.candidateCard}>
                  <div className={styles.photoBox}>Foto</div>
                  <h4>{c.nama}</h4>
                  <div className={styles.buttonGroupSmall}>
                    <button className={styles.btnEdit}>Edit</button>
                    <button className={styles.btnDelete}>Hapus</button>
                  </div>
                </div>
              )) : (
                <p>Belum ada kandidat.</p>
              )}
            </div>
            <button className={styles.btnGreen} style={{marginTop: '20px'}}>+ Tambah Kandidat Baru</button>
          </section>
        )}

      </main>
    </div>
  );
}
