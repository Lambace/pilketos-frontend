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

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "X", 
    kelas: "",
    image_url: "",
    nomor_urut: "",
    vision: "",
    mission: "-"
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditingKandidat, setIsEditingKandidat] = useState(false);
  const [currentKandidatId, setCurrentKandidatId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. LOAD DATA (MEMASTIKAN KANDIDAT MUNCUL)
  const loadData = async () => {
    try {
      const resS = await fetch(`${API_URL}/students`);
      const resC = await fetch(`${API_URL}/candidates`);
      const sData = await resS.json();
      const cData = await resC.json();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. FUNGSI NAVIGASI AMAN
  const changeView = (newView: string) => {
    setView(newView);
    // Reset form saat pindah view agar tidak tabrakan
    setFormData({ nisn: "", name: "", tingkat: "X", kelas: "", image_url: "", nomor_urut: "", vision: "", mission: "-" });
    setIsEditingKandidat(false);
  };

  // 3. FUNGSI RESET SEMUA SISWA
  const handleResetAllStudents = async () => {
    if (!confirm("⚠️ Hapus SELURUH data siswa?")) return;
    try {
      await fetch(`${API_URL}/students`, { method: "DELETE" });
      alert("✅ Data siswa dibersihkan");
      loadData();
    } catch (err) { alert("Gagal reset"); }
  };

  // 4. HANDLER KANDIDAT (AGAR TIDAK KOSONG)
  const handleSubmitKandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("vision", formData.vision);
    data.append("mission", "-");
    data.append("nomor_urut", formData.nomor_urut);
    if (selectedFile) data.append("photo", selectedFile);

    const url = isEditingKandidat ? `${API_URL}/candidates/${currentKandidatId}` : `${API_URL}/candidates`;
    const method = isEditingKandidat ? "PUT" : "POST";

    try {
      await fetch(url, { method, body: data });
      alert("✅ Kandidat Berhasil Disimpan");
      loadData();
      changeView("input-kandidat");
    } catch (err) { alert("Gagal simpan kandidat"); }
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button type="button" onClick={() => changeView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button type="button" onClick={() => changeView("input-nisn")} className={view.includes("nisn") ? styles.active : ""}>👤 Data Siswa</button>
          <button type="button" onClick={() => changeView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Data Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Siswa</h3><p>{students.length}</p></div>
              <div className={styles.statCard}><h3>Kandidat</h3><p>{candidates.length}</p></div>
            </div>
          </div>
        )}

        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button type="button" onClick={handleResetAllStudents} className={styles.btnReset}>🗑️ Reset Semua</button>
                <button type="button" onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Tambah Manual</button>
                <button type="button" onClick={() => fileInputRef.current?.click()} className={styles.btnImport}>📤 Import Excel</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={async (e) => {
                   const file = e.target.files?.[0];
                   if(file) {
                     const fd = new FormData(); fd.append("file", file);
                     await fetch(`${API_URL}/students/import`, { method: "POST", body: fd });
                     loadData();
                   }
                }} />
              </div>
            </div>
            <table className={styles.table}>
              <thead><tr><th>NISN</th><th>Nama</th><th>Aksi</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.nisn}>
                    <td>{s.nisn}</td><td>{s.name || s.nama}</td>
                    <td><button type="button" onClick={() => handleDeleteStudent(s.nisn)} className={styles.btnDelete}>Hapus</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {view === "input-kandidat" && (
          <section>
            <div className={styles.formContainer}>
              <h2>Tambah/Edit Kandidat</h2>
              <form onSubmit={handleSubmitKandidat}>
                <div className={styles.inputField}><label>Nomor Urut</label>
                <input type="number" value={formData.nomor_urut} onChange={e=>setFormData({...formData, nomor_urut:e.target.value})} required /></div>
                <div className={styles.inputField}><label>Nama</label>
                <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required /></div>
                <div className={styles.inputField}><label>Visi</label>
                <textarea value={formData.vision} onChange={e=>setFormData({...formData, vision:e.target.value})} required /></div>
                <div className={styles.inputField}><label>Foto</label>
                <input type="file" onChange={e=>setSelectedFile(e.target.files?.[0] || null)} /></div>
                <button type="submit" className={styles.btnSave}>Simpan Kandidat</button>
              </form>
            </div>
            <div className={styles.candidateGrid}>
              {candidates.map(c => (
                <div key={c.id} className={styles.candidateCard}>
                  <img src={`${API_URL}${c.photo}`} className={styles.candidateThumb} alt="" onError={e=>e.currentTarget.src="/logo-osis.png"} />
                  <h3>{c.name}</h3>
                </div>
              ))}
            </div>
          </section>
        )}

        {(view === "form-manual-nisn") && (
            <section className={styles.formContainer}>
                <h2>Tambah Siswa Manual</h2>
                <div className={styles.inputField}><label>NISN</label>
                <input type="text" value={formData.nisn} onChange={e=>setFormData({...formData, nisn:e.target.value})} /></div>
                <div className={styles.inputField}><label>Nama</label>
                <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} /></div>
                <button type="button" onClick={async () => {
                    await fetch(`${API_URL}/students`, {
                        method: "POST",
                        headers: {"Content-Type":"application/json"},
                        body: JSON.stringify({nisn: formData.nisn, name: formData.name, tingkat: "X", kelas: "Manual"})
                    });
                    alert("Berhasil"); loadData(); setView("input-nisn");
                }} className={styles.btnSave}>Simpan Siswa</button>
            </section>
        )}
      </main>
    </div>
  );
}
