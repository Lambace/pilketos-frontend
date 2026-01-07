"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
  const checkAccess = async () => {
    const nisn = localStorage.getItem("nisn");

    // 1. Cek apakah sudah login
    if (!nisn) {
      router.push("/login");
      return;
    }

    try {
      // 2. Verifikasi status terbaru ke server
      const data = await login(nisn);

      // 3. Jika ternyata sudah pernah voting (alreadyVoted), usir dari halaman ini
      if (data.alreadyVoted) {
        alert("Anda sudah melakukan voting sebelumnya!");
        localStorage.removeItem("nisn"); // Opsional: hapus session jika ingin login ulang
        router.push("/login");
      }
    } catch (error) {
      console.error("Gagal memverifikasi status:", error);
      router.push("/login");
    }
  };

  checkAccess();
}, [router]);

    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_URL}/candidates`);
        if (!res.ok) throw new Error("Gagal mengambil data kandidat");
        const data = await res.json();
        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [router]);

  const handleVote = async (candidateId: number, candidateName: string) => {
    const confirmVote = confirm(`Apakah Anda yakin memilih: ${candidateName}?`);
    if (!confirmVote) return;

    setIsProcessing(true);
    const nisn = localStorage.getItem("nisn");

    try {
      const res = await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn, candidate_id: candidateId }),
      });

      const data = await res.json(); // Ambil data json dulu untuk cek pesan error

      if (res.ok) {
        alert("✅ Berhasil menyimpan suara!");
        localStorage.removeItem("nisn"); // Hapus hanya NISN saja lebih aman daripada clear()
        router.push("/login"); 
      } else {
        // Jika gagal karena sudah pernah voting (already voted)
        alert("❌ Gagal: " + (data.error || "Terjadi kesalahan."));
        
        // Jika errornya spesifik tentang sudah memilih, baru clear & redirect
        if (res.status === 400 || data.error?.includes("anda sudah memilih sebelumnya")) {
           localStorage.removeItem("nisn");
           router.push("/login");
        }
      }
    } catch (err) {
      // Jika hanya error koneksi, jangan clear storage dulu agar user bisa coba klik lagi
      alert("⚠️ Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.voteContent}>
      <img src="/logo-putih.png" alt="Logo OSIS" className={styles.logo} />
      <h1>SILAHKAN PILIH KANDIDAT ANDA !!!</h1>
      <p className={styles.subtitle}>Gunakan hak suara Anda secara bijak, jujur, dan adil.</p>

      {loading ? (
        <div className={styles.loader}>Memuat daftar kandidat...</div>
      ) : candidates.length === 0 ? (
        <div className={styles.emptyState}>
          <p>KANDIDAT BELUM DIMASUKKAN OLEH ADMIN</p>
        </div>
      ) : (
        <div className={styles.mainWrapper}>
          <div className={styles.candidateGrid}>
            {candidates.map((c) => (
              <div key={c.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  
                  {/* Lencana Nomor Urut Melayang */}
                  <div className={styles.nomorBadge}>
                    {String(c.nomor_urut || 0).padStart(2, '0')}
                  </div>

                  <img
                    src={c.photo ? `${API_URL}${c.photo}` : "/logo-osis.png"}
                    alt={c.name}
                    className={styles.photo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo-osis.png";
                    }}
                  />
                </div>
                
                <div className={styles.info}>
                  <h2>{c.name}</h2>
                  <button
                    onClick={() => handleVote(c.id, c.name)}
                    disabled={isProcessing}
                    className={styles.voteButton}
                  >
                    {isProcessing ? "Menyimpan..." : "Berikan Suara"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <footer className={styles.footer}>
        &copy; 2026 Panitia Pemilihan Ketua OSIS
      </footer>
    </div>
  );
}
