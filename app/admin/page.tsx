"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { 
  getStudents, deleteStudent, getCandidates, addCandidate, addStudent, 
  resetStudents, importStudents, updateStudent, downloadStudentFormat,
  updateCandidate, deleteCandidate 
} from "../../lib/api";

// Sesuaikan dengan URL Backend Anda
const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isEditingKandidat, setIsEditingKandidat] = useState(false);
  const [currentKandidatId, setCurrentKandidatId] = useState<number | null>(null);
  
  // State untuk file fisik
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "-", 
    kelas: "-",
    image_url: "" 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const candidatePhotoRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const sData = await getStudents();
      const cData = await getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      setCandidates(Array.isArray(cData) ? cData : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveSiswa = async () => {
    if (!formData.nisn || !formData.name) return alert("⚠️ NISN dan Nama wajib diisi!");
    try {
      if (view === "edit-siswa") {
        await updateStudent(formData.nisn, formData);
        alert("✅ Berhasil Update Siswa!");
      } else {
        await addStudent(formData);
        alert("✅ Berhasil Simpan Siswa!");
      }
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "" });
      loadData();
      setView("input-nisn");
    } catch (err: any) { alert("❌ " + err.message); }
  };

  const handleEditKandidat = (c: any) => {
    setIsEditingKandidat(true);
    setCurrentKandidatId(c.id);
    setFormData({
      ...formData,
      name: c.name,
      image_url: c.photo, // Ini berisi path dari server (/upload/candidates/...)
      nisn: c.vision 
    });
    setSelectedFile(null); // Reset pilihan file saat mulai edit
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitKandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // WAJIB menggunakan FormData untuk upload file
      const data = new FormData();
      data.append("name", formData.name);
      data.append("vision", formData.nisn);
      data.append("mission", "-");
      
      if (selectedFile) {
        data.append("photo", selectedFile);
      } else if (isEditingKandidat) {
        // Jika edit tapi tidak ganti foto, kirim path foto lama
        data.append("photo", formData.image_url);
      }

      if (isEditingKandidat && currentKandidatId) {
        await updateCandidate(currentKandidatId, data);
        alert("✅ Kandidat diperbarui!");
      } else {
        if (!selectedFile) return alert("Silakan pilih foto kandidat!");
        await addCandidate(data);
        alert("✅ Kandidat ditambahkan!");
      }

      // Reset
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "" });
      setSelectedFile(null);
      setIsEditingKandidat(false);
      setCurrentKandidatId(null);
      loadData();
    } catch (err) {
      alert("❌ Gagal menyimpan data kandidat. Pastikan backend mendukung upload.");
    }
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn")} className={view.includes("nisn") || view === "edit-siswa" ? styles.active : ""}>👤 Data Siswa</button>
          <button onClick={() => setView("input-kandidat")} className={view === "input-kandidat" ? styles.active : ""}>🗳️ Data Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {/* VIEW DASHBOARD */}
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator 👋</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Total Siswa</h3><p>{students.length}</p></div>
              <div className={styles.statCard}><h3>Total Kandidat</h3><p>{candidates.length}</p></div>
            </div>
          </div>
        )}

        {/* VIEW INPUT KANDIDAT (UPLOAD LOKAL) */}
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
                  <label>Pilih Foto Kandidat (Upload Lokal)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    ref={candidatePhotoRef}
                  />
                  
                  {/* Preview Gambar */}
                  {(selectedFile || formData.image_url) && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontSize: '12px', color: '#666' }}>Pratinjau:</p>
                      <img 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : `${API_URL}${formData.image_url}`} 
                        alt="preview" 
                        style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #ddd' }} 
                        onError={(e) => (e.currentTarget.src = "/logo-osis.png")} 
                      />
                    </div>
                  )}
                </div>

                <div className={styles.inputField}>
                  <label>Visi & Misi</label>
                  <textarea 
                    className={styles.textarea}
                    placeholder="Tuliskan visi dan misi kandidat di sini..."
                    value={formData.nisn} 
                    onChange={e => setFormData({...formData, nisn: e.target.value})} 
                    required 
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className={styles.btnSave}>
                    {isEditingKandidat ? "Update Data" : "Simpan Kandidat"}
                  </button>
                  {isEditingKandidat && (
                    <button type="button" onClick={() => {
                      setIsEditingKandidat(false);
                      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "" });
                      setSelectedFile(null);
                    }} className={styles.btnCancel}>Batal</button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ marginTop: '40px' }}>
              <h2>Daftar Kandidat</h2>
              <div className={styles.candidateGridCustom}>
                {candidates.map((c) => (
                  <div key={c.id} className={styles.candidateCardItem}>
                    <img 
                      src={c.photo ? `${API_URL}${c.photo}` : "/logo-osis.png"} 
                      alt={c.name} 
                      className={styles.candidateThumb}
                      onError={(e) => {(e.target as HTMLImageElement).src = '/logo-osis.png'}}
                    />
                    <h3>{c.name}</h3>
                    <div className={styles.actionBtns}>
                      <button onClick={() => handleEditKandidat(c)} className={styles.btnSmallEdit}>Edit</button>
                      <button onClick={() => { if(confirm("Hapus?")) deleteCandidate(c.id).then(loadData); }} className={styles.btnSmallDelete}>Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VIEW INPUT NISN / SISWA */}
        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => { setFormData({nisn:"", name:"", tingkat:"-", kelas:"-", image_url:""}); setView("form-manual-nisn"); }} className={styles.btnManual}>➕ Input Manual</button>
                <button onClick={() => downloadStudentFormat()} className={styles.btnExcel}>📥 Format Excel</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                    const fd = new FormData(); fd.append("file", file);
                    importStudents(fd).then(() => { alert("Import Berhasil"); loadData(); });
                  }
                }} />
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
                      <button onClick={() => { if(confirm("Hapus?")) deleteStudent(s.nisn).then(loadData); }} className={styles.btnDelete}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* FORM MANUAL SISWA */}
        {(view === "form-manual-nisn" || view === "edit-siswa") && (
          <section className={styles.formContainer}>
            <h2>{view === "edit-siswa" ? "Edit" : "Tambah"} Siswa</h2>
            <div className={styles.inputField}>
              <label>NISN</label>
              <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} disabled={view === "edit-siswa"} />
            </div>
            <div className={styles.inputField}>
              <label>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button onClick={handleSaveSiswa} className={styles.btnSave}>Simpan</button>
              <button onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
