"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { 
  getStudents, 
  deleteStudent, 
  getCandidates, 
  addStudent, 
  resetStudents, 
  importStudents, 
  updateStudent,
  downloadStudentFormat 
} from "../../lib/api";

type View = "dashboard" | "input-nisn" | "input-kandidat" | "form-manual-nisn" | "edit-siswa";

export default function AdminPage() {
  const [view, setView] = useState<View>("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // Form States
  const [formData, setFormData] = useState({ id: null, nisn: "", name: "", tingkat: "-", kelas: "-" });
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

  // ✅ 1. DOWNLOAD FORMAT (Menggunakan fungsi dari lib/api)
  const handleDownloadFormat = () => {
    try {
      downloadStudentFormat();
      alert("📥 Permintaan download dikirim ke server...");
    } catch (err) { alert("❌ Gagal mendownload format."); }
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
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
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

  const handleSave = async () => {
  if (!formData.nisn || !formData.name) return alert("⚠️ NISN dan Nama wajib diisi!");
  
  // Pastikan tingkat dan kelas tidak kosong agar database tidak error
  const dataToSend = {
    ...formData,
    tingkat: formData.tingkat || "-", // Beri nilai default
    kelas: formData.kelas || "-"      // Beri nilai default
  };

  try {
    if (view === "edit-siswa" && formData.id) {
      await updateStudent(formData.id, dataToSend);
      alert("✅ Data berhasil diperbarui!");
    } else {
      await addStudent(dataToSend);
      alert("✅ Siswa berhasil ditambahkan!");
    }
    // ... sisa kode reset form
  } catch (err) {
    console.error(err); // Lihat error spesifik di console inspect element
    alert("❌ Terjadi kesalahan saat menyimpan. Cek NISN apakah sudah terdaftar?");
  }
};

        

  // ✅ 5. HANDLE EDIT BUTTON
  const handleEditClick = (siswa: any) => {
    setFormData({
      id: siswa.id,
      nisn: siswa.nisn,
      name: siswa.name,
      tingkat: siswa.tingkat || "-",
      kelas: siswa.kelas || "-"
    });
    setView("edit-siswa");
  };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn")} className={view === "input-nisn" || view === "form-manual-nisn" || view === "edit-siswa" ? styles.active : ""}>👤 Input NISN</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Input Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {/* VIEW: DASHBOARD */}
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator 👋</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Siswa (DPT)</h3><p>{students.length}</p></div>
              <div className={styles.statCard}><h3>Kandidat</h3><p>{candidates.length}</p></div>
            </div>
            <div className={styles.infoBox}>
              <p>Gunakan sidebar untuk mengelola data pemilihan. Pastikan data NISN sudah benar sebelum memulai voting.</p>
            </div>
          </div>
        )}

        {/* VIEW: TABEL NISN */}
        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => {
                  setFormData({ id: null, nisn: "", name: "", tingkat: "-", kelas: "-" });
                  setView("form-manual-nisn");
                }} className={styles.btnManual}>➕ Input Manual</button>
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
                {students.length > 0 ? students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nisn}</td>
                    <td>{s.name}</td>
                    <td>{s.tingkat} {s.kelas}</td>
                    <td className={styles.tableActions}>
                      <button className={styles.btnEdit} onClick={() => handleEditClick(s)}>Edit</button>
                      <button onClick={() => {
                        if(confirm("Hapus siswa ini?")) deleteStudent(s.id).then(loadData);
                      }} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className={styles.empty}>Belum ada data siswa.</td></tr>
                )}
              </tbody>
            </table>
            <button onClick={handleResetData} className={styles.btnReset}>⚠️ Hapus Semua Data Siswa</button>
          </section>
        )}

        {/* VIEW: FORM MANUAL (TAMBAH & EDIT) */}
        {(view === "form-manual-nisn" || view === "edit-siswa") && (
          <section className={styles.formContainer}>
            <h2>{view === "edit-siswa" ? "Edit Data Siswa" : "Tambah Siswa Manual"}</h2>
            <div className={styles.inputField}>
              <label>NISN</label>
              <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} />
            </div>
            <div className={styles.inputField}>
              <label>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button className={styles.btnSave} onClick={handleSave}>
                {view === "edit-siswa" ? "Update Data" : "Simpan Data"}
              </button>
              <button className={styles.btnCancel} onClick={() => setView("input-nisn")}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
