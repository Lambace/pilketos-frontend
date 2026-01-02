"use client";
import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import Link from "next/link";

export default function AdminPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editVision, setEditVision] = useState("");
  const [editMission, setEditMission] = useState("");

  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`);
        const data = await res.json();
        setCandidates(data);
      } catch {
        setMessage("⚠️ Tidak bisa menghubungi server.");
      }
    };
    fetchCandidates();
  }, []);

  // ✅ Tambah kandidat
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
        setName("");
        setPhoto(null);
        setVision("");
        setMission("");
      } else setMessage("❌ " + (data.error || "Gagal tambah kandidat"));
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Tidak bisa menghubungi server.");
    }
  };

  // ✅ Edit kandidat
  const handleSaveEdit = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          vision: editVision,
          mission: editMission,
          photo: null, // kalau mau support edit foto, tambahkan field upload
        }),
      });
      if (res.ok) {
        setCandidates(
          candidates.map((c) =>
            c.id === id
              ? { ...c, name: editName, vision: editVision, mission: editMission }
              : c
          )
        );
        setMessage("✏️ Kandidat diperbarui");
        setEditingId(null);
      }
    } catch {
      setMessage("⚠️ Gagal menyimpan perubahan.");
    }
  };

  // ✅ Hapus kandidat
  const handleDeleteCandidate = async (id: number) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus kandidat ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCandidates(candidates.filter((c) => c.id !== id));
        setMessage("🗑️ Kandidat dihapus");
      }
    } catch {
      setMessage("⚠️ Gagal menghapus kandidat.");
    }
  };
// Tambahkan fungsi ini di dalam komponen AdminPage
const handleresetAllVotes = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes/reset`, {
    method: "DELETE", // Atau POST tergantung rute di backend Anda
  });

  if (!res.ok) {
    throw new Error("Gagal meriset data suara");
  }

  alert("✅ Semua suara berhasil direset!");
  // Opsional: muat ulang data atau status
  window.location.reload(); 
};

const handleResetSingle = async (nisn: string) => {
  if (confirm(`Izinkan NISN ${nisn} untuk memilih ulang?`)) {
    try {
      await resetStudentVote(nisn);
      alert("Siswa tersebut sekarang bisa login dan memilih lagi.");
      window.location.reload();
    } catch (err) {
      alert("Gagal: " + err.message);
    }
  }
};

  // Tambahkan ini agar TypeScript tidak error lagi
const resetStudentVote = async (nisn: string) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes/reset/${nisn}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Gagal meriset pilihan siswa");

    alert(`✅ Berhasil! Siswa dengan NISN ${nisn} sekarang bisa memilih lagi.`);
    // Refresh data agar tampilan terupdate
    window.location.reload(); 
  } catch (err) {
    console.error(err);
    alert("⚠️ Terjadi kesalahan saat meriset data.");
  }
};
  return (
    <div className={styles.container}>
      {message && <p className={styles.message}>{message}</p>}

      <img src="/logo-vote.png" alt="Logo OSIS" className={styles.logoGlow} />

      <div className={styles.buttonGroup}>
        <Link href="/nisn" className={styles.adminCard}>
          <div className={styles.icon}>📝</div>
          <div className={styles.text}>Input NISN</div>
        </Link>
        <Link href="/hasil-vote" className={styles.adminCard}>
          <div className={styles.icon}>📊</div>
          <div className={styles.text}>Hasil Voting</div>
        </Link>
      </div>

      <h2>Tambah Kandidat</h2>
      <div className={styles.form}>
        <input type="text" placeholder="Nama Kandidat" value={name} onChange={(e) => setName(e.target.value)} />
        <textarea placeholder="Visi" value={vision} onChange={(e) => setVision(e.target.value)} />
        <textarea placeholder="Misi" value={mission} onChange={(e) => setMission(e.target.value)} />
        <input type="file" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
        <button onClick={handleAddCandidate}>Simpan Kandidat</button>
      </div>

      <h2>Daftar Kandidat</h2>
      <table className={styles.table}>
        <thead>
          <tr><th>Nama</th><th>Visi</th><th>Misi</th><th>Foto</th><th>Aksi</th></tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td>
                {editingId === c.id ? (
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : c.name}
              </td>
              <td>
                {editingId === c.id ? (
                  <textarea value={editVision} onChange={(e) => setEditVision(e.target.value)} />
                ) : c.vision}
              </td>
              <td>
                {editingId === c.id ? (
                  <textarea value={editMission} onChange={(e) => setEditMission(e.target.value)} />
                ) : c.mission}
              </td>
              <td>
                {c.photo ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}/upload/${c.photo}`} alt={c.name} style={{ width: "80px" }} />
                ) : "Tidak ada foto"}
              </td>
              <td className={styles.actions}>
                {editingId === c.id ? (
                  <>
                    <button className={styles.save} onClick={() => handleSaveEdit(c.id)}>Simpan</button>
                    <button className={styles.cancel} onClick={() => setEditingId(null)}>Batal</button>
                  </>
                ) : (
                  <>
                    <button className={styles.edit} onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                      setEditVision(c.vision);
                      setEditMission(c.mission);
                    }}>✏️ Edit</button>
                    <button className={styles.delete} onClick={() => handleDeleteCandidate(c.id)}>🗑️ Hapus</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
