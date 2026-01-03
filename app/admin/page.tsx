"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
// Pastikan updateCandidate dan deleteCandidate sudah ada di lib/api
import { 
  getStudents, deleteStudent, getCandidates, addCandidate, addStudent, 
  resetStudents, importStudents, updateStudent, downloadStudentFormat,
  updateCandidate, deleteCandidate 
} from "../../lib/api";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isEditingKandidat, setIsEditingKandidat] = useState(false);
  const [currentKandidatId, setCurrentKandidatId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "-", 
    kelas: "-",
    image_url: "" 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const sData = await getStudents();
      const cData = await getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    if (!formData.nisn || !formData.name) return alert("⚠️ NISN dan Nama wajib diisi!");
    try {
      if (view === "edit-siswa") {
        await updateStudent(formData.nisn, formData);
        alert("✅ Berhasil Update!");
      } else {
        await addStudent(formData);
        alert("✅ Berhasil Simpan!");
      }
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "" });
      loadData();
      setView("input-nisn");
    } catch (err: any) { alert("❌ " + err.message); }
  };

  const handleDelete = async (nisn: string) => {
    if (!confirm("Hapus siswa ini?")) return;
    try {
      await deleteStudent(nisn);
      loadData();
    } catch (err) { alert("Gagal hapus"); }
  };

  // --- LOGIKA EDIT KANDIDAT ---
  const handleEditKandidat = (c: any) => {
    setIsEditingKandidat(true);
    setCurrentKandidatId(c.id);
    setFormData({
      ...formData,
      name: c.name,
      image_url: c.photo,
      nisn: c.vision // Karena kamu simpan Visi di field nisn
    });
    // Scroll ke form agar admin tahu sedang mengedit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- LOGIKA HAPUS KANDIDAT ---
  const handleDeleteKandidat = async (id: number) => {
    if (!confirm("Hapus kandidat ini? Semua perolehan suara kandidat ini akan hilang!")) return;
    try {
      await deleteCandidate(id);
      alert("✅ Kandidat berhasil dihapus");
      loadData();
    } catch (err) { alert("❌ Gagal menghapus kandidat"); }
  };

  // --- SUBMIT KANDIDAT (TAMBAH & EDIT) ---
  const handleSubmitKandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        photo: formData.image_url,
        vision: formData.nisn,
        mission: "-"
      };

      if (isEditingKandidat && currentKandidatId) {
        await updateCandidate(currentKandidatId, payload);
        alert("✅ Kandidat berhasil diperbarui!");
      } else {
        await addCandidate(payload);
        alert("✅ Kandidat berhasil ditambahkan!");
      }

      // Reset Form
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "" });
      setIsEditingKandidat(false);
      setCurrentKandidatId(null);
      loadData();
    } catch (err) {
      alert("❌ Gagal menyimpan data kandidat");
    }
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn")} className={view.includes("nisn") || view === "edit-siswa" ? styles.active : ""}>👤 Input NISN</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Input Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator 👋</h1>
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
                <button onClick={() => { setFormData({nisn:"", name:"", tingkat:"-", kelas:"-", image_url:""}); setView("form-manual-nisn"); }} className={styles.btnManual}>➕ Input Manual</button>
                <button onClick={() => downloadStudentFormat()} className={styles.btnExcel}>📥 Download Format</button>
                <input type="file" ref={fileInputRef} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                    const fd = new FormData(); fd.append("file", file);
                    importStudents(fd).then(() => { alert("Import Berhasil"); loadData(); });
                  }
                }} style={{display:'none'}} />
                <button onClick={() => fileInputRef.current?.click()} className={styles.btnImport}>📤 Import Excel</button>
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
                      <button onClick={() => { setFormData({...s, image_url: ""}); setView("edit-siswa"); }} className={styles.btnEdit}>Edit</button>
                      <button onClick={() => handleDelete(s.nisn)} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={async () => { if(confirm("Reset?")) { await resetStudents(); loadData(); } }} className={styles.btnReset}>⚠️ Reset Semua Siswa</button>
          </section>
        )}

        {view === "input-kandidat" && (
          <section>
            <div className={styles.formContainer}>
              <h1>{isEditingKandidat ? "📝 Edit Kandidat" : "➕ Input Kandidat Baru"}</h1>
              <form onSubmit={handleSubmitKandidat}>
                <div className={styles.inputField}>
                  <label>Nama Kandidat</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.inputField}>
                  <label>URL Foto (Link Gambar)</label>
                  <input type="text" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} required />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="preview" style={{ width: '50px', marginTop: '10px', borderRadius: '5px' }} onError={(e) => (e.currentTarget.src = "/logo-osis.png")} />
                  )}
                </div>
                <div className={styles.inputField}>
                  <label>Visi & Misi</label>
                  <textarea 
                    style={{ width: '100%', padding: '10px', minHeight: '100px', borderRadius: '8px', border: '1px solid #ddd' }} 
                    value={formData.nisn} 
                    onChange={e => setFormData({...formData, nisn: e.target.value})} 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className={styles.btnSave}>
                    {isEditingKandidat ? "Update Kandidat" : "Simpan Kandidat"}
                  </button>
                  {isEditingKandidat && (
                    <button type="button" onClick={() => {
                      setIsEditingKandidat(false);
                      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "" });
                    }} className={styles.btnCancel}>Batal Edit</button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ marginTop: '40px' }}>
              <h2>Daftar Kandidat Terdaftar</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {candidates.map((c) => (
                  <div key={c.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <img 
                      src={c.photo} 
                      alt={c.name} 
                      style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #eee' }} 
                      onError={(e) => {(e.target as HTMLImageElement).src = 'https://via.placeholder.com/100'}}
                    />
                    <h3 style={{ margin: '5px 0' }}>{c.name}</h3>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>ID: {c.id}</p>
                    
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleEditKandidat(c)} 
                        style={{ padding: '5px 12px', fontSize: '12px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteKandidat(c.id)} 
                        style={{ padding: '5px 12px', fontSize: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
                {candidates.length === 0 && <p>Belum ada kandidat.</p>}
              </div>
            </div>
          </section>
        )}

        {(view === "form-manual-nisn" || view === "edit-siswa") && (
          <section className={styles.formContainer}>
            <h2>{view === "edit-siswa" ? "Edit" : "Tambah"} Siswa</h2>
            <div className={styles.inputField}>
              <label>NISN</label>
              <input type="text" placeholder="NISN" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} disabled={view === "edit-siswa"} />
            </div>
            <div className={styles.inputField}>
              <label>Nama</label>
              <input type="text" placeholder="Nama" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button onClick={handleSave} className={styles.btnSave}>Simpan</button>
              <button onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
