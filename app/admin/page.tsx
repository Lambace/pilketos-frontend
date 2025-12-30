"use client";
import { useState, useEffect } from "react";
import styles from "./admin.module.css";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function AdminPage() {
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editVision, setEditVision] = useState("");
  const [editMission, setEditMission] = useState("");

  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch("/candidates");
        const data = await res.json();
        setCandidates(data);
      } catch {
        setMessage("⚠️ Tidak bisa menghubungi server.");
      }
    };
    fetchCandidates();
  }, []);

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
        setCandidates([...candidates, { ...data }]);
        setMessage("✅ Kandidat berhasil ditambahkan");
        setName(""); 
        setVision(""); 
        setMission(""); 
        setPhoto(null);
      } else setMessage("❌ " + data.error);
    } catch {
      console.error(err);
      setMessage("⚠️ Tidak bisa menghubungi server.");
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`/candidates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, vision: editVision, mission: editMission }),
      });
      if (res.ok) {
        setCandidates(
          candidates.map((c) =>
            c.id === id ? { ...c, name: editName, vision: editVision, mission: editMission } : c
          )
        );
        setMessage("✏️ Kandidat diperbarui");
        setEditingId(null);
      }
    } catch {
      setMessage("⚠️ Gagal menyimpan perubahan.");
    }
  };

  const handleDeleteCandidate = async (id) => {
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus kandidat ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/candidates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCandidates(candidates.filter((c) => c.id !== id));
        setMessage("🗑️ Kandidat dihapus");
      }
    } catch {
      setMessage("⚠️ Gagal menghapus kandidat.");
    }
  };

  return (
    <div className={styles.container}>
      {message && <p className={styles.message}>{message}</p>}

      <img
              src="/logo-vote.png"
              alt="Logo OSIS"
              className={`${styles.logoGlow} ${styles.fadeIn} ${styles.delay1}`}
            />

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
function err(err: any) {
  throw new Error("Function not implemented.");
}

