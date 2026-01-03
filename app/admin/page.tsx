"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css"; // Pastikan file ini ada
import { getStudents, deleteStudent, updateStudent } from "../../lib/api";

export default function AdminPage() {
  const [students, setStudents] = useState<any[]>([]);

  const loadData = async () => {
    const data = await getStudents();
    setStudents(Array.isArray(data) ? data : []);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Panel Admin</h1>
      
      <div className={styles.buttonGroup}>
        <Link href="/hasil-vote" className={styles.adminCard}>
          <div className={styles.icon}>📊</div>
          <div className={styles.text}>Hasil Vote</div>
        </Link>
        {/* Tombol lainnya... */}
      </div>

      <h2 className={styles.subtitle}>Daftar Siswa</h2>
      <table className={styles.table}>
        <thead>
          <tr>
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
                <td>{s.name || s.nama || "-"}</td>
                <td>{s.tingkat} {s.kelas}</td>
                <td>
                  <button 
                    onClick={() => deleteStudent(s.nisn).then(loadData)} 
                    className={styles.btnDelete}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4} className={styles.empty}>Data tidak ditemukan / Kosong</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}