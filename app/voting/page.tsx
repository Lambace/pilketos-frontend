"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";
import { apiFetch } from "../../lib/api";
export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Ambil data kandidat
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch("/candidates");
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        setMessage("⚠️ Tidak bisa ambil data kandidat");
      }
    };
    fetchCandidates();
  }, []);

  const handleVote = async (candidateId: number) => {
  setLoading(true);

  const nisn = localStorage.getItem("nisn"); // ✅ ambil dari login
  if (!nisn) {
    alert("Silakan login dulu");
    router.push("/login");
    return;
  }

  try {
    const res = await fetch("/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nisn, candidate_id: candidateId }), // ✅ kirim NISN
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ " + data.message);
      router.push("/login"); // redirect setelah sukses
    } else {
      alert("❌ Vote gagal: " + data.error);
      router.push("/login"); // redirect juga setelah gagal
    }
  } catch (err) {
    console.error("Error:", err);
    alert("⚠️ Terjadi error saat vote");
    router.push("/login"); // redirect juga kalau error
  } finally {
    setLoading(false);
  }
};

  return (
  <div className={styles.voteContent}>
    <img src="/logo-osis.png" alt="Logo" className={styles.logo} />
    <h1>Pilih Kandidat Ketua OSIS</h1>

    {candidates.length === 0 ? (
      <p style={{ color: "red", fontWeight: "bold" }}>
        KANDIDAT BELUM DI MASUKKAN
      </p>
    ) : (
      <>
        {message && <p style={{ color: "yellow" }}>{message}</p>}
        <div className={styles.candidateGrid}>
          {candidates.map((c) => (
            <div key={c.id} className={styles.card}>
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/upload/${c.photo}`}
                alt={c.name}
                className={styles.photo}
              />
              <h2>{c.name}</h2>
              <p>
                <strong>Visi:</strong> {c.vision}
              </p>
              <p>
                <strong>Misi:</strong> {c.mission}
              </p>
              <button
                onClick={() => handleVote(c.id)}
                disabled={loading}
                className={styles.voteButton}
              >
                {loading ? "Loading..." : "Pilih"}
              </button>
            </div>
          ))}
        </div>
      </>
    )}
  </div>
);
          }
