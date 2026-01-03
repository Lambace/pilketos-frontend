"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { getStudents, deleteStudent, getCandidates } from "../../lib/api";

type View = "dashboard" | "input-nisn" | "input-kandidat";

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

  useEffect(() => { loadData(); }, []);

  // Handler untuk Tombol
  const handleReset = () => { if(confirm("Reset semua data?")) { /* logik reset */ } };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn")} className={view === "input-nisn" ? styles.active : ""}>👤 Input NISN</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Input Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      {/* CONTENT AREA */}
      <main className={styles.mainContent}>
        {view === "dashboard" && (
          <div>
            <h1>Selamat Datang Admin</h1>
            <p>Pilih menu di samping untuk mengelola data pemungutan suara.</p>
          </div>
        )}

        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Manajemen Data NISN</h1>
              <div className={styles.actionBtns}>
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
                {students.map((s) => (
                  <tr key={s.nisn}>
                    <td>{s.nisn}</td>
                    <td>{s.nama || s.name}</td>
                    <td>
                      <button className={styles.btnEdit}>Edit</button>
                      <button onClick={() => deleteStudent(s.nisn).then(loadData)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleReset} className={styles.btnReset}>Reset Data Siswa</button>
          </section>
        )}

        {view === "input-kandidat" && (
          <section>
            <h1>Data Kandidat</h1>
            <div className={styles.candidateGrid}>
              {candidates.map((c) => (
                <div key={c.id} className={styles.candidateCard}>
                  <img src={c.foto} alt={c.nama} width={100} />
                  <h4>{c.nama}</h4>
                  <div className={styles.cardActions}>
                    <button className={styles.btnEdit}>Edit</button>
                    <button className={styles.btnDelete}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
            <button className={styles.btnGreen}>+ Tambah Kandidat Baru</button>
          </section>
        )}
      </main>
    </div>
  );
}
