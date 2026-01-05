"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import {
  getStudents, deleteStudent, getCandidates, addCandidate, addStudent,
  importStudents, updateStudent,
  updateCandidate, deleteCandidate, resetAllStudents, downloadStudentFormat
} from "../../lib/api";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    nisn: "", name: "", tingkat: "X", kelas: "Umum",
    id: "", vision: "", mission: "", nomor_urut: ""
  });

  const excelInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const sData = await getStudents();
      const cData = await getCandidates();
      setStudents(Array.isArray(sData) ? sData : []);
      const sortedCandidates = Array.isArray(cData)
        ? [...cData].sort((a, b) => parseInt(a.nomor_urut) - parseInt(b.nomor_urut))
        : [];
      setCandidates(sortedCandidates);
    } catch (err) { console.error("Gagal load data:", err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleResetFormUI = () => {
    setFormData({
      nisn: "", name: "", tingkat: "X", kelas: "Umum",
      id: "", vision: "", mission: "", nomor_urut: ""
    });
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleDatabaseReset = async () => {
    if (confirm("⚠️ PERINGATAN! Ini akan menghapus SEMUA SISWA dan SEMUA SUARA. Lanjutkan?")) {
      try {
        setLoading(true);
        await resetAllStudents();
        alert("✅ Database berhasil dikosongkan!");
        loadData();
      } catch (err) { alert("Gagal reset database"); }
      finally { setLoading(false); }
    }
  };

  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (view === "edit-siswa") {
        await updateStudent(formData.nisn, formData);
        alert("✅ Berhasil diupdate!");
      } else {
        await addStudent(formData);
        alert("✅ Berhasil ditambah!");
      }
      handleResetFormUI();
      await loadData();
      setView("input-nisn");
    } catch (err: any) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  const handleSaveKandidat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("nomor_urut", formData.nomor_urut);
    data.append("vision", formData.vision);
    data.append("mission", formData.mission);
    if (selectedFile) data.append("photo", selectedFile);

    try {
      if (view === "edit-kandidat") {
        await updateCandidate(formData.id, data);
        alert("✅ Berhasil diupdate!");
      } else {
        await addCandidate(data);
        alert("✅ Berhasil ditambah!");
      }
      handleResetFormUI();
      await loadData();
      setView("input-kandidat");
    } catch (err: any) { alert("Gagal: " + err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>E-Vote Admin</h2>
        <nav className={styles.nav}>
          <button onClick={() => setView("dashboard")} className={view === "dashboard" ? styles.active : ""}>🏠 Dashboard</button>
          <button onClick={() => setView("input-nisn")} className={view.includes("nisn") || view === "edit-siswa" ? styles.active : ""}>👤 Data Siswa</button>
          <button onClick={() => setView("input-kandidat")} className={view.includes("kandidat") ? styles.active : ""}>🗳️ Data Kandidat</button>
          <Link href="/hasil-vote" className={styles.navLink}>📊 Hasil Vote</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>

          {/* VIEW: DASHBOARD */}
          {view === "dashboard" && (
            <div className={styles.sectionWrapper}>
              <h1 className={styles.pageTitle}>Dashboard Administrator 👋</h1>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}><h3>Total Siswa</h3><p className={styles.statNumber}>{students.length}</p></div>
                <div className={styles.statCard}><h3>Total Kandidat</h3><p className={styles.statNumber}>{candidates.length}</p></div>
              </div>
            </div>
          )}

          {/* VIEW: DAFTAR SISWA */}
          {view === "input-nisn" && (
            <section className={styles.sectionWrapper}>
              <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>Data Siswa</h1>
                <div className={styles.buttonGroupLarge}>
                  <button onClick={() => { handleResetFormUI(); setView("form-manual-nisn"); }} className={styles.btnPrimary}>+ Tambah</button>
                  <button onClick={() => downloadStudentFormat()} className={styles.btnSecondary}>📥 Format Excel</button>
                  <input type="file" ref={excelInputRef} hidden onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const fd = new FormData(); fd.append("file", file);
                      await importStudents(fd); alert("Import Berhasil!"); loadData();
                    }
                  }} />
                  <button onClick={() => excelInputRef.current?.click()} className={styles.btnSuccess}>📤 Import Data</button>
                  <button onClick={handleDatabaseReset} className={styles.btnDanger}>🔥 Reset</button>
                </div>
              </div>
              <div className={styles.tableCard}>
                <table className={styles.table}>
                  <thead>
                    <tr><th>NISN</th><th>Nama</th><th style={{ textAlign: 'center' }}>Aksi</th></tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.nisn}>
                        <td>{s.nisn}</td>
                        <td style={{ fontWeight: '500' }}>{s.name || s.nama}</td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button onClick={() => { setFormData({ ...s, name: s.name || s.nama }); setView("edit-siswa"); }} className={styles.btnEditSmall}>Edit</button>
                            <button onClick={() => { if (confirm("Hapus?")) deleteStudent(s.nisn).then(loadData); }} className={styles.btnDeleteSmall}>Hapus</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* VIEW: DAFTAR KANDIDAT */}
          {view === "input-kandidat" && (
            <section className={styles.sectionWrapper}>
              <div className={styles.headerRow}>
                <h1 className={styles.pageTitle}>Data Kandidat</h1>
                <button onClick={() => { handleResetFormUI(); setView("form-kandidat"); }} className={styles.btnPrimary}>+ Tambah Kandidat</button>
              </div>
              <div className={styles.candidateGrid}>
                {candidates.map((c) => (
                  <div key={c.id} className={styles.candidateCard}>
                    <div className={styles.photoWrapper}>
                      <div className={styles.numberBadge}>{String(c.nomor_urut).padStart(2, '0')}</div>
                      <img src={`https://voting-backend-production-ea29.up.railway.app${c.photo}`} alt={c.name} className={styles.candidatePhoto} />
                    </div>
                    <div className={styles.candidateInfo}>
                      <h4>{c.name}</h4>
                      <div className={styles.cardActions}>
                        <button onClick={() => {
                          setFormData({ ...c, id: c.id });
                          setImagePreview(`https://voting-backend-production-ea29.up.railway.app${c.photo}`);
                          setView("edit-kandidat");
                        }} className={styles.btnEditSmall}>Edit</button>
                        <button onClick={() => { if (confirm("Hapus?")) deleteCandidate(c.id).then(loadData); }} className={styles.btnDeleteSmall}>Hapus</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* VIEW: FORM KANDIDAT (TAMBAH & EDIT) */}
          {(view === "form-kandidat" || view === "edit-kandidat") && (
            <div className={styles.formCenterWrapper}>
              <section className={styles.formCard}>
                <h2 className={styles.formTitle}>{view === "edit-kandidat" ? "Edit" : "Tambah"} Kandidat</h2>
                <form onSubmit={handleSaveKandidat}>
                  <div className={styles.formGroup}>
                    <label>Nomor Urut</label>
                    <input type="number" placeholder="Contoh: 01" value={formData.nomor_urut} onChange={e => setFormData({ ...formData, nomor_urut: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Nama Kandidat</label>
                    <input type="text" placeholder="Nama Lengkap" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Foto Kandidat</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSelectedFile(file);
                      if (file) setImagePreview(URL.createObjectURL(file));
                    }} className={styles.input} />
                  </div>
                  {imagePreview && (
                    <div className={styles.previewSection}>
                      <div className={styles.photoWrapper} style={{ border: '2px dashed #1cb5e0', margin: '1rem auto', maxWidth: '200px', height: '200px' }}>
                        <img src={imagePreview} alt="Preview" className={styles.candidatePhoto} />
                      </div>
                    </div>
                  )}
                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setView("input-kandidat")} className={styles.btnCancel}>Batal</button>
                    <button type="submit" className={styles.btnSubmit} disabled={loading}>{loading ? "Menyimpan..." : "Simpan Data"}</button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {/* VIEW: FORM SISWA (TAMBAH & EDIT) */}
          {(view === "form-manual-nisn" || view === "edit-siswa") && (
            <div className={styles.formCenterWrapper}>
              <section className={styles.formCard}>
                <h2 className={styles.formTitle}>{view === "edit-siswa" ? "Edit" : "Tambah"} Siswa</h2>
                <form onSubmit={handleSaveSiswa}>
                  <div className={styles.formGroup}><label>NISN</label>
                    <input type="text" value={formData.nisn} onChange={e => setFormData({ ...formData, nisn: e.target.value })} disabled={view === "edit-siswa"} className={styles.input} required />
                  </div>
                  <div className={styles.formGroup}><label>Nama Lengkap</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={styles.input} required />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" onClick={() => setView("input-nisn")} className={styles.btnCancel}>Batal</button>
                    <button type="submit" className={styles.btnSubmit}>{loading ? "Memproses..." : "Simpan Data"}</button>
                  </div>
                </form>
              </section>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}