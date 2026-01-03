"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./admin.module.css";
import { 
  getStudents, deleteStudent, getCandidates, addCandidate, addStudent, 
  resetStudents, importStudents, updateStudent, downloadStudentFormat 
} from "../../lib/api";

export default function AdminPage() {
  const [view, setView] = useState("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [formData, setFormData] = useState({ nisn: "", name: "", tingkat: "-", kelas: "-" });
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
      setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-" });
      loadData();
      setView("input-nisn");
    } catch (err: any) { alert("❌ " + err.message); }
  };

  const handleEdit = (s: any) => {
    setFormData({ nisn: s.nisn, name: s.name, tingkat: s.tingkat, kelas: s.kelas });
    setView("edit-siswa");
  };

  const handleDelete = async (nisn: string) => {
    if (!confirm("Hapus siswa ini?")) return;
    try {
      await deleteStudent(nisn);
      loadData();
    } catch (err) { alert("Gagal hapus"); }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // PERBAIKAN: Hapus huruf 's', sesuaikan dengan nama yang di-import
    await addCandidate(formData); 
    alert("✅ Kandidat berhasil ditambahkan!");
    setFormData({ nisn: "", name: "", tingkat: "-", kelas: "-" }); // Reset form
    loadData(); // Refresh data
    setView("dashboard"); // Kembali ke dashboard
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

       {/* --- SECTION DATA SISWA --- */}
        {view === "input-nisn" && (
          <section>
            <div className={styles.headerRow}>
              <h1>Data Siswa</h1>
              <div className={styles.buttonGroupLarge}>
                <button onClick={() => { setFormData({nisn:"", name:"", tingkat:"-", kelas:"-"}); setView("form-manual-nisn"); }} className={styles.btnManual}>➕ Input Manual</button>
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
                <tr>
                  <th>NISN</th>
                  <th>Nama</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((s) => (
                    <tr key={s.nisn}>
                      <td>{s.nisn}</td>
                      <td>{s.name || s.nama || "-"}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button onClick={() => handleEdit(s)} className={styles.btnEdit}>Edit</button>
                          <button onClick={() => handleDelete(s.nisn)} className={styles.btnDelete}>Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className={styles.empty}>Data tidak ditemukan / Kosong</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button onClick={async () => { if(confirm("Reset semua?")) { await resetStudents(); loadData(); } }} className={styles.btnReset}>⚠️ Reset Semua Siswa</button>
          </section>
        )}

        {/* --- FORM INPUT KANDIDAT --- */}
        {view === "input-kandidat" && (
          <section className={styles.formContainer}>
            <h1>Input Kandidat Baru</h1>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputField}>
                <label>Nama Kandidat</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Andi & Budi"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>
              <div className={styles.inputField}>
                <label>Visi & Misi (Singkat)</label>
                <textarea 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                  placeholder="Masukkan visi misi..."
                  value={formData.nisn} // Menggunakan field nisn sementara agar tidak error
                  onChange={e => setFormData({...formData, nisn: e.target.value})} 
                />
              </div>
              <div className={styles.buttonGroupLarge}>
                <button type="submit" className={styles.btnSave}>Simpan Kandidat</button>
                <button type="button" className={styles.btnCancel} onClick={() => setView("dashboard")}>Batal</button>
              </div>
            </form>
          </section>
        )}
            
                }} style={{display:'none'}} />
                <button onClick={() => fileInputRef.current?.click()} className={styles.btnImport}>📤 Import Excel</button>
              </div>
            </div>
           <table className={styles.table}>
  <thead>
    <tr>
      <th>NISN</th>
      <th>Nama</th>
      {/* Kolom Kelas sudah dihapus dari sini */}
      <th>Aksi</th>
    </tr>
  </thead>
  <tbody>
    {students.length > 0 ? (
      students.map((s) => (
        <tr key={s.nisn}>
          <td>{s.nisn}</td>
          <td>{s.name || s.nama || "-"}</td>
          {/* Baris data kelas (s.tingkat/s.kelas) sudah dihapus dari sini */}
          <td>
            <div className={styles.actionButtons}>
               <button 
                onClick={() => handleEdit(s)} 
                className={styles.btnEdit}
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(s.nisn)} 
                className={styles.btnDelete}
              >
                Hapus
              </button>
            </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={3} className={styles.empty}> {/* colSpan diubah jadi 3 */}
          Data tidak ditemukan / Kosong
        </td>
      </tr>
    )}
  </tbody>
</table>
            <button onClick={async () => { if(confirm("Reset semua?")) { await resetStudents(); loadData(); } }} className={styles.btnReset}>⚠️ Reset Semua Siswa</button>
          </section>
        )}

        {(view === "form-manual-nisn" || view === "edit-siswa") && (
          <section className={styles.formContainer}>
            <h2>{view === "edit-siswa" ? "Edit Siswa" : "Tambah Siswa"}</h2>
            <div className={styles.inputField}><label>NISN</label>
              <input type="text" value={formData.nisn} disabled={view === "edit-siswa"} onChange={e => setFormData({...formData, nisn: e.target.value})} />
            </div>
            <div className={styles.inputField}><label>Nama</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.buttonGroupLarge}>
              <button className={styles.btnSave} onClick={handleSave}>Simpan</button>
              <button className={styles.btnCancel} onClick={() => setView("input-nisn")}>Batal</button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
