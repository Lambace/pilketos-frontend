"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { 
  getStudents, deleteStudent, getCandidates, addCandidate, addStudent, 
  importStudents, updateStudent, downloadStudentFormat,
  updateCandidate, deleteCandidate 
} from "../../lib/api";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "X", 
    kelas: "Umum",
    image_url: "",
    nomor_urut: "" 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const sData = await getStudents();
      const cData = await getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) { console.error("Gagal load data:", err); }
  };

  useEffect(() => { loadData(); }, []);

  // FUNGSI SIMPAN SISWA YANG DIPERBAIKI
  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn || !formData.name) return alert("⚠️ NISN dan Nama wajib diisi!");
    
    setLoading(true);
    try {
      if (view === "edit-siswa") {
        await updateStudent(formData.nisn, {
            nisn: formData.nisn,
            name: formData.name,
            tingkat: formData.tingkat,
            kelas: formData.kelas
        });
        alert("✅ Berhasil Update Siswa!");
      } else {
        // Pastikan field sesuai dengan database (nisn, name, tingkat, kelas)
        await addStudent({
            nisn: formData.nisn,
            name: formData.name,
            tingkat: formData.tingkat,
            kelas: formData.kelas
        });
        alert("✅ Berhasil Simpan Siswa!");
      }
      
      // Reset dan balik ke tabel
      setFormData({ nisn: "", name: "", tingkat: "X", kelas: "Umum", image_url: "", nomor_urut: "" });
      await loadData();
      setView("input-nisn");
    } catch (err: any) { 
      console.error("Error Server:", err);
      alert("❌ Gagal Simpan: " + (err.message || "Terjadi kesalahan pada server. Pastikan NISN belum ada di database.")); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button type="button" onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button type="button" onClick={() => setView("input-nisn")} className={view.includes("nisn") || view === "edit-siswa" ? styles.active : ""}>👤 Data Siswa</button>
          <button type="button" onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Data Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

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
                <button type="button" onClick={() => { setFormData({nisn:"", name:"", tingkat:"X", kelas:"Umum", image_url:"", nomor_urut:""}); setView("form-manual-nisn"); }} className={styles.btnManual}>➕ Input Manual</button>
                <button type="button" onClick={() => downloadStudentFormat()} className={styles.btnExcel}>📥 Format Excel</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                    const fd = new FormData(); fd.append("file", file);
                    importStudents(fd).then(() => { alert("Import Berhasil"); loadData(); });
                  }
                }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.btnImport}>📤 Import Excel</button>
              </div>
            </div>
            <table className={styles.table}>
              <thead><tr><th>NISN</th><th>Nama</th><th>Aksi</th></tr></thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.nisn}>
                    <td>{s.nisn}</td><td>{s.name || s.nama}</td>
                    <td>
                      <button type="button" onClick={() => { setFormData({...s, name: s.name || s.nama}); setView("edit-siswa"); }} className={styles.btnEdit}>Edit</button>
                      <button type="button" onClick={() => { if(confirm("Hapus?")) deleteStudent(s.nisn).then(loadData); }} className={styles.btnDelete}>Hapus</button>
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
            <form onSubmit={handleSaveSiswa}>
                <div className={styles.inputField}>
                <label>NISN</label>
                <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} disabled={view === "edit-siswa"} required />
                </div>
                <div className={styles.inputField}>
                <label>Nama Lengkap</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.buttonGroupLarge}>
                <button type="submit" className={styles.btnSave} disabled={loading}>
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button type="button" onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
                </div>
            </form>
          </section>
        )}

        {/* View Kandidat tetap sama seperti kode asli Anda */}
        {view === "input-kandidat" && (
            <section>
                <div className={styles.candidateGrid}>
                    {candidates.map(c => (
                        <div key={c.id} className={styles.candidateCard}>
                            <img src={`${API_URL}${c.photo}`} className={styles.candidateThumb} alt="" onError={e => e.currentTarget.src="/logo-osis.png"} />
                            <h3>{c.name}</h3>
                        </div>
                    ))}
                </div>
            </section>
        )}
      </main>
    </div>
  );
}