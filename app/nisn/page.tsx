"use client";
import { useState, useEffect } from "react";
import styles from "./nisn.module.css";
import Link from "next/link"
import { apiFetch } from "../../lib/api";
interface Student {
  id: number;
  nisn: string;
  name: string;
  tingkat: string;
  kelas: string;
}

const CLASS_OPTIONS: Record<string, string[]> = {
  X: ["X TJKT 1", "X TJKT 2", "X PPLG 1"],
  XI: ["XI TJKT 1", "XI TJKT 2", "XI PPLG 1"],
  XII: ["XII TJKT 1", "XII TJKT 2", "XII PPLG 1"],
};

export default function NISNInputPage() {
  const [nisn, setNisn] = useState("");
  const [name, setName] = useState("");
  const [tingkat, setTingkat] = useState("X");
  const [kelas, setKelas] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [status, setStatus] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // ambil data siswa
  const fetchStudents = async () => {
    try {
      const res = await fetch("/students");
      const data = await res.json();
      setStudents(data);
    } catch {
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // tambah / update siswa
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nisn.length < 10) {
      setStatus("❌ NISN harus 10 digit.");
      return;
    }
    const payload = { nisn, name, tingkat, kelas };
    const url = editingId
      ? `${process.env.NEXT_PUBLIC_API_URL}/${editingId}`
      : "${process.env.NEXT_PUBLIC_API_URL}/students";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus(editingId ? "✅ Siswa berhasil diupdate." : "✅ Siswa berhasil ditambahkan.");
        setNisn(""); setName(""); setTingkat("X"); setKelas(""); setEditingId(null);
        console.log("Submit update:", { editingId, payload });

        fetchStudents();
      } else {
        const err = await res.json();
        setStatus("❌ " + err.error);
      }
    } catch {
      setStatus("⚠️ Terjadi kesalahan koneksi.");
    }
  };

  // import excel
  const handleImportExcel = async () => {
  if (!excelFile) {
    setStatus("❌ Pilih file Excel terlebih dahulu.");
    return;
  }
  console.log("File yang dipilih:", excelFile);
  const formData = new FormData();
  formData.append("file", excelFile);

  try {
    const res = await 
    fetch("${process.env.NEXT_PUBLIC_API_URL}/students/import", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setStatus("✅ Data siswa berhasil diimport.");
      fetchStudents(); // refresh daftar dari server
    } else {
      const err = await res.json();
      setStatus("❌ " + err.error);
    }
  } catch {
    setStatus("⚠️ Terjadi kesalahan koneksi.");
  }
};

  // download format excel
  const handleDownloadFormat = () => {
    window.open("${process.env.NEXT_PUBLIC_API_URL}/students/download-format", "_blank");
  };

  // tombol edit 
    const handleEdit = (s: Student) => {
    console.log("Edit siswa:", s);
    setNisn(s.nisn);
    setName(s.name);
    setTingkat(s.tingkat);
    setKelas(s.kelas);
    setEditingId(s.id);
    setStatus("✏️ Mode edit aktif.");
  };

  // hapus siswa
  const handleDelete = async (id: number) => {
  if (!confirm("Yakin hapus siswa ini?")) return;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/students/${id}`, { method: "DELETE" });
    if (res.ok) {
      setStatus("🗑️ Siswa dihapus.");
      fetchStudents(); // ✅ refresh dari server, bukan hanya filter state
    } else {
      const err = await res.json();
      setStatus("❌ " + err.error);
    }
  } catch {
    setStatus("⚠️ Terjadi kesalahan koneksi.");
  }
};

  // reset semua siswa
  const handleResetAll = async () => {
  if (!confirm("Yakin reset semua siswa?")) return;
  try {
    const res = await fetch("${process.env.NEXT_PUBLIC_API_URL}/students", { method: "DELETE" });
    if (res.ok) {
      setStatus("🗑️ Semua siswa dihapus.");
      fetchStudents(); // ✅ refresh daftar dari server
    } else {
      const err = await res.json();
      setStatus("❌ " + err.error);
    }
  } catch {
    setStatus("⚠️ Terjadi kesalahan koneksi.");
  }
};

   
return (
   <div className={styles.container}> 
   <header className={styles.topBar}> 
   <Link href="/admin" className={`${styles.button} ${styles.buttonPrimary}`}> 
   Admin 
   </Link> 
   </header> 
   <img src="/logo-vote.png" alt="Logo Sekolah" className={styles.logo} /> 
   <h1 className={styles.title}>
     Input NISN Siswa
     </h1> 
     {/* Form input */} 
     <form onSubmit={handleSubmit} className={styles.form}> <label className={styles.label}> NISN <input type="text" placeholder="NISN" value={nisn} onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10)) } required className={styles.input} /> </label> <label className={styles.label}> Nama <input type="text" placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} required className={styles.input} /> </label>
        <label className={styles.label}>
          Tingkat
          <select
            value={tingkat}
            onChange={(e) => setTingkat(e.target.value)}
            className={styles.select}
          >
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
          </select>
        </label>

        <label className={styles.label}>
          Kelas
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            required
            className={styles.select}
          >
            {(CLASS_OPTIONS[tingkat] || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {editingId ? "Update Siswa" : "Tambah Siswa"}
        </button>
      </form>

      {/* Import Excel */}
      <div className={styles.form}>
        <h3>Import Excel</h3>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) =>
            setExcelFile(e.target.files ? e.target.files[0] : null)
          }
          className={styles.input}
        />
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleImportExcel}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            📤 Import Excel
          </button>
          <button
            onClick={handleDownloadFormat}
            className={`${styles.button} ${styles.buttonPrimary}`}
>
            📥 Download Format Excel
          </button>
        </div>
      </div>

      {status && <p className={styles.message}>{status}</p>}

      {/* Daftar siswa */}
      <h2 className={styles.title}>Daftar Siswa</h2>
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
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.nisn}</td>
              <td>{s.name}</td>
              <td>{s.tingkat}</td>
              <td>{s.kelas}</td>
              <td className={styles.actions}>
                <button
                  onClick={() => handleEdit(s)} 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className={`${styles.button} ${styles.buttonDanger}`}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length > 0 && (
        <button
         onClick={handleResetAll}
          className={`${styles.button} ${styles.buttonDanger}`}
        >
          Reset Semua
        </button>
      )}
    </div>
    
  );
}
