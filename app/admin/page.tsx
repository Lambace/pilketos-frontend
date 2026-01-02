"use client";
import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import Link from "next/link";
import { getStudents, deleteStudent, updateStudent, importStudents } from "../../lib/api";

export default function AdminPage() {
  // --- STATE KANDIDAT ---
  const [candidates, setCandidates] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  
  // --- STATE SISWA (BARU DITAMBAHKAN) ---
  const [students, setStudents] = useState<any[]>([]);
  
  // --- STATE UI ---
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editVision, setEditVision] = useState("");
  const [editMission, setEditMission] = useState("");

  // Ambil data saat halaman dimuat
  useEffect(() => {
    fetchCandidates();
    fetchStudentsList();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`);
      const data = await res.json();
      setCandidates(data);
    } catch {
      setMessage("⚠️ Tidak bisa menghubungi server.");
    }
  };

  const fetchStudentsList = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error("Gagal ambil siswa:", err);
    }
  };

  // --- LOGIKA KANDIDAT ---
  const handleAddCandidate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("vision", vision);
      formData.append("mission", mission);
      if (photo) formData.append("photo", photo);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setCandidates([...candidates, data]);
        setMessage("✅ Kandidat berhasil ditambahkan");
        setName(""); setVision(""); setMission(""); setPhoto(null);
      } else setMessage("❌ " + (data.error || "Gagal"));
    } catch (err) {
      setMessage("⚠️ Error server.");
    }
  };

  // --- LOGIKA SISWA (Hapus & Update) ---
  const handleDeleteStudent = async (nisn: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      try {
        await deleteStudent(nisn);
        setStudents(students.filter(s => s.nisn !== nisn));
        alert("Terhapus!");
      } catch (err) {
        alert("Gagal menghapus");
      }
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMessage("⏳ Mengimpor...");
      await importStudents(file);
      setMessage("✅ Import berhasil!");
      fetchStudentsList(); // Refresh tabel
    } catch (err: any) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className={styles.container}>
      {message && <p className={styles.message}>{message}</p>}

      <img src="/logo-vote.png" alt="Logo OSIS" className={styles.logoGlow} />

      <div className={styles.buttonGroup}>
        <Link href="/hasil-vote" className={styles.adminCard}>
          <div className={styles.icon}>📊</div>
          <div className={styles.text}>Hasil Voting</div>
        </Link>
        <div className={styles.adminCard} style={{cursor: 'pointer'}}>
          <div className={styles.icon}>📥</div>
          <input type="file" onChange={handleImportFile} style={{display:'none'}} id="importExcel" />
          <label htmlFor="importExcel" style={{cursor: 'pointer'}} className={styles.text}>Import Siswa</label>
        </div>
      </div>

      {/* SEKSI FORM KANDIDAT */}
      <h2>Tambah Kandidat</h2>
      <div className={styles.form}>
        <input type="text" placeholder="Nama Kandidat" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Visi" value={vision} onChange={(e) => setVision(e.target.value)} />
        <textarea placeholder="Misi" value={mission} onChange={(e) => setMission(e.target.value)} />
        <input type="file" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        <button onClick={handleAddCandidate}>Simpan Kandidat</button>
      </div>

      {/* SEKSI TABEL SISWA */}
      <h2>Daftar Siswa</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>NISN</th>
            <th>Nama</th>
            <th>Tingkat</th>
            <th>Kelas</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students && students.length > 0 ? (
            students.map((s, index) => (
              <tr key={s.nisn || index}>
                <td>{s.nisn || "-"}</td>
                <td>{s.name || s.nama || s.Nama || "-"}</td> 
                <td>{s.tingkat || "-"}</td>
                <td>{s.kelas || "-"}</td>
                <td>
                  <button onClick={() => handleDeleteStudent(s.nisn)} className={styles.btnDelete}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={5} style={{ textAlign: 'center' }}>Data siswa kosong</td></tr>
          )}
        </tbody>
      </table>

      {/* SEKSI TABEL KANDIDAT */}
      <h2>Daftar Kandidat</h2>
      <table className={styles.table}>
        <thead>
          <tr><th>Nama</th><th>Visi</th><th>Foto</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.vision?.substring(0, 30)}...</td>
              <td>{c.photo ? "Ada" : "Tidak"}</td>
              <td>
                <button onClick={() => confirm("Hapus kandidat?")}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
