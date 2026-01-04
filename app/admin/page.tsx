"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { 
  getStudents, deleteStudent, getCandidates, addCandidate, addStudent, 
  resetStudents, importStudents, updateStudent, downloadStudentFormat,
  updateCandidate, deleteCandidate 
} from "../../lib/api";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isEditingKandidat, setIsEditingKandidat] = useState(false);
  const [currentKandidatId, setCurrentKandidatId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({ 
    nisn: "", 
    name: "", 
    tingkat: "-", 
    kelas: "-",
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
    } catch (err) { 
      console.error("Gagal memuat data:", err); 
    }
  };

  useEffect(() => { loadData(); }, []);

  // Handler Hapus Siswa
  const handleDeleteSiswa = async (nisn: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        await deleteStudent(nisn);
        alert("✅ Siswa berhasil dihapus");
        await loadData();
      } catch (err) {
        alert("❌ Gagal menghapus siswa");
      }
    }
  };

  // Handler Simpan Siswa
  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn || !formData.name) return alert("⚠️ NISN dan Nama wajib diisi!");
    try {
      if (view === "edit-siswa") {
        await updateStudent(formData.nisn, formData);
        alert("✅ Berhasil Update Siswa!");
      } else {
        await addStudent(formData);
        alert("✅ Berhasil Simpan Siswa!");
      }
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "", nomor_urut: "" });
      await loadData();
      setView("input-nisn");
    } catch (err: any) { alert("❌ Gagal menyimpan"); }
  };

  // Handler Reset Semua Siswa (Fungsi Baru di Top Bar)
  const handleResetSiswa = async () => {
    if (confirm("⚠️ PERINGATAN: Hapus SELURUH data siswa?")) {
      if (confirm("Tindakan ini permanen. Lanjutkan?")) {
        try {
          await resetStudents();
          alert("✅ Semua data siswa telah dihapus.");
          await loadData();
        } catch (err) {
          alert("❌ Gagal mereset data.");
        }
      }
    }
  };

  const handleEditKandidat = (c: any) => {
    setIsEditingKandidat(true);
    setCurrentKandidatId(c.id);
    setFormData({
      ...formData,
      name: c.name,
      image_url: c.photo,
      nisn: c.vision || "", 
      nomor_urut: c.nomor_urut || ""
    });
    setSelectedFile(null);
    setView("input-kandidat");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitKandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("vision", formData.nisn);
      data.append("mission", "-");
      data.append("nomor_urut", formData.nomor_urut);
      
      if (selectedFile) {
        data.append("photo", selectedFile);
      }

      if (isEditingKandidat && currentKandidatId) {
        await updateCandidate(currentKandidatId, data);
        alert("✅ Kandidat diperbarui!");
      } else {
        if (!selectedFile) return alert("Silakan pilih foto kandidat!");
        await addCandidate(data);
        alert("✅ Kandidat ditambahkan!");
      }

      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-", image_url: "", nomor_urut: "" });
      setSelectedFile(null);
      setIsEditingKandidat(false);
      await loadData();
    } catch (err) {
      alert("❌ Gagal menyimpan data kandidat.");
    }
  };

  const handleDeleteKandidat = async (id: number) => {
    if (confirm("Hapus kandidat ini?")) {
      try {
        await deleteCandidate(id);
        await loadData();
      } catch (err) {
        alert("Gagal menghapus");
      }
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
        {view === "dashboard" && (
          <div className={styles.welcomeSection}>
            <h1>Dashboard Administrator 👋</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}><h3>Total Siswa</h3><p className={styles.statNumber}>{students.length}</p></div>
              <div className={styles.statCard}><h3>Total Kandidat</h3><p className={styles.statNumber}>{candidates.length}</p></div>
            </div>
          </div>
        )}

        {view === "input-kandidat" && (
          <section>
            <div className={styles.formContainer}>
              <h1>{isEditingKandidat ? "📝 Edit Kandidat" : "➕ Input Kandidat Baru"}</h1>
              <form onSubmit={handleSubmitKandidat}>
                <div className={styles.inputField}>
                  <label>Nomor Urut</label>
                  <input type="number" value={formData.nomor_urut} onChange={e => setFormData({...formData, nomor_urut: e.target.value})} required />
                </div>
                <div className={styles.inputField}>
                  <label>Nama Kandidat</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className={styles.inputField}>
                  <label>Foto</label>
                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
                <div className={styles.inputField}>
                  <label>Visi & Misi</label>
                  <textarea value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} required />
                </div>
                <div className={styles.buttonGroupSmall}>
                  <button type="submit" className={styles.btnSave}>Simpan</button>
                  {isEditingKandidat && (
                    <button type="button" onClick={() => setIsEditingKandidat(false)} className={styles.btnCancel}>Batal</button>
                  )}
                </div>
              </form>
            </div>

            <div className={styles.candidateGrid}>
              {candidates.map((c) => (
                <div key={c.id} className={styles.candidateCard}>
                  <div className={styles.badge}>{String(c.nomor_urut || 0).padStart(2, '0')}</div>
                  <img src={c.photo ? `${API_URL}${c.photo}` : "/logo-osis.png"} className={styles.candidateThumb} alt={c.name} />
                  <h3>{c.name}</h3>
                  <div className={styles.buttonGroupSmall}>
                    <button onClick={() => handleEditKandidat(c)} className={styles.btnEdit}>Edit</button>
                    <button onClick={() => handleDeleteKandidat(c.id)} className={styles.btnDelete}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={handleResetSiswa} className={styles.btnReset}>🗑️ Reset Semua</button>
                <button onClick={() => setView("form-manual-nisn")} className={styles.btnManual}>➕ Input Manual</button>
                <button onClick={() => downloadStudentFormat()} className={styles.btnExcel}>📥 Format Excel</button>
                <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if(file) {
                    const fd = new FormData(); fd.append("file", file);
                    await importStudents(fd);
                    alert("Import Berhasil");
                    loadData();
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
                      <button onClick={() => { setFormData({...s, name: s.name || s.nama}); setView("edit-siswa"); }} className={styles.btnEdit}>Edit</button>
                      <button onClick={() => handleDeleteSiswa(s.nisn)} className={styles.btnDelete}>Hapus</button>
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
                <input type="text" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} disabled={view === "edit-siswa"} />
              </div>
              <div className={styles.inputField}>
                <label>Nama</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className={styles.buttonGroupLarge}>
                <button type="submit" className={styles.btnSave}>Simpan</button>
                <button type="button" onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
