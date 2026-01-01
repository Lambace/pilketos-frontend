"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Default true saat muat awal
  const [votingAction, setVotingAction] = useState(false); // Loading khusus saat klik tombol
  const [message, setMessage] = useState("");

  // ✅ 1. Proteksi Halaman & Ambil Data
  useEffect(() => {
    const nisn = localStorage.getItem("nisn");
    if (!nisn) {
      router.replace("/login"); // Gunakan replace agar tidak bisa "back" ke halaman ini
      return;
    }

    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/candidates`);
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        setCandidates(data);
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Gagal memuat daftar kandidat");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [router]);

  // ✅ 2. Fungsi Kirim Vote
  const handleVote = async (candidateId: number, candidateName: string) => {
    const nisn = localStorage.getItem("nisn");
    
    if (!nisn) {
      alert("Sesi Anda habis, silakan login kembali.");
      router.push("/login");
      return;
    }

    // Konfirmasi sebelum memilih
    const yakin = confirm(`Apakah Anda yakin ingin memberikan suara kepada ${candidateName}? \n\n(Pilihan tidak dapat diubah setelah ini)`);
    if (!yakin) return;

    setVotingAction(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn, candidate_id: candidateId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Berhasil! " + (data.message || "Suara Anda telah direkam."));
        localStorage.removeItem("nisn"); // Bersihkan session
        router.replace("/login"); // Balik ke login
      } else {
        // Jika error (misal: sudah memilih), beritahu user
        alert("❌ Gagal: " + (data.error || data.message || "Terjadi kesalahan"));
        localStorage.removeItem("nisn");
        router.replace("/login");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Terjadi kesalahan koneksi ke server.");
    } finally {
      setVotingAction(false);
    }
  };

  // ✅ 3. Tampilan Loading Awal
  if (loading) {
    return (
      <div className={styles.voteContent}>
        <div className={styles.loader}>Memuat Kandidat...</div>
      </div>
    );
  }

  return (
    <div className={styles.voteContent}>
      <div className={styles.header}>
        <img src="/logo-osis.png" alt="Logo" className={styles.logo} />
        <h1>SURAT SUARA DIGITAL</h1>
        <p>Pilih satu kandidat terbaik menurut Anda</p>
      </div>

      {candidates.length === 0 ? (
        <div className={styles.noData}>
          <p>⚠️ KANDIDAT BELUM DIMASUKKAN</p>
          <button onClick={() => router.push("/login")}>Kembali</button>
        </div>
      ) : (
        <>
          {message && <p className={styles.errorMessage}>{message}</p>}
          
          <div className={styles.candidateGrid}>
            {candidates.map((c) => (
              <div key={c.id} className={styles.card}>
                <div className={styles.photoContainer}>
                  <img
                    src={c.photo.startsWith('http') ? c.photo : `${process.env.NEXT_PUBLIC_API_URL}/upload/${c.photo}`}
                    alt={c.name}
                    className={styles.photo}
                  />
                </div>
                
                <div className={styles.details}>
                  <h2 className={styles.candidateName}>{c.name}</h2>
                  <div className={styles.infoBox}>
                    <p><strong>VISI:</strong><br/>{c.vision}</p>
                    <p><strong>MISI:</strong><br/>{c.mission}</p>
                  </div>
                  
                  <button
                    onClick={() => handleVote(c.id, c.name)}
                    disabled={votingAction}
                    className={styles.voteButton}
                  >
                    {votingAction ? "Memproses..." : "BERIKAN SUARA"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <footer className={styles.footer}>
        <p>SMK NEGERI 2 KOLAKA © 2026</p>
      </footer>
    </div>
  );
}
