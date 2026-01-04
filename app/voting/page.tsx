"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";

// SESUAIKAN DENGAN URL BACKEND RAILWAY ANDA
const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 1. PROTEKSI HALAMAN: Cek apakah sudah login
    const nisn = localStorage.getItem("nisn");
    if (!nisn) {
      alert("Akses ditolak. Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    // 2. AMBIL DATA KANDIDAT
    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_URL}/candidates`);
        if (!res.ok) throw new Error("Gagal mengambil data kandidat");
        const data = await res.json();
        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Gagal memuat daftar kandidat. Pastikan koneksi internet stabil.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidates();
  }, [router]);

  const handleVote = async (candidateId: number, candidateName: string) => {
    // 3. KONFIRMASI PILIHAN
    const confirmVote = confirm(`Apakah Anda yakin ingin memberikan suara kepada: ${candidateName}? \n\n(Tindakan ini hanya bisa dilakukan satu kali)`);
    if (!confirmVote) return;

    setIsProcessing(true);
    const nisn = localStorage.getItem("nisn");

    try {
      const res = await fetch(`${API_URL}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn, candidate_id: candidateId }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + (data.message || "Terima kasih! Suara Anda telah berhasil disimpan."));
        
        // 4. LOGOUT OTOMATIS: Hapus sesi agar tidak bisa vote lagi
        localStorage.removeItem("nisn");
        localStorage.removeItem("role"); 
        
        router.push("/login"); 
      } else {
        // Jika backend mengirim error (misal: "Sudah pernah memilih")
        alert("❌ Gagal: " + (data.error || "Terjadi kesalahan saat menyimpan suara."));
        localStorage.removeItem("nisn"); // Tetap logout untuk keamanan
        router.push("/login");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("⚠️ Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.voteContent}>
      {/* Pastikan file logo-osis.png ada di folder /public */}
      <img src="/logo-osis.png" alt="Logo OSIS" className={styles.logo} />
      
      <h1>E-VOTING KETUA OSIS</h1>
      <p className={styles.subtitle}>Gunakan hak suara Anda secara bijak, jujur, dan adil.</p>

      {loading ? (
        <div className={styles.loader}>Memuat daftar kandidat...</div>
      ) : candidates.length === 0 ? (
        <div className={styles.emptyState}>
          <p>KANDIDAT BELUM DIMASUKKAN OLEH ADMIN</p>
        </div>
      ) : (
        <div className={styles.mainWrapper}>
          {message && <p className={styles.errorMessage}>{message}</p>}
          
          <div className={styles.candidateGrid}>
            {candidates.map((c) => (
              <div key={c.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    src={c.photo || "/logo-osis.png"}
                    alt={c.name}
                    className={styles.photo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo-osis.png";
                    }}
                  />
                </div>
                
                <div className={styles.info}>
                  <span className={styles.candidateNumber}>Kandidat #{c.id}</span>
                  <h2>{c.name}</h2>
                  
                  <div className={styles.visionMission}>
                    <p><strong>Visi:</strong> {c.vision || "-"}</p>
                    <p><strong>Misi:</strong> {c.mission || "-"}</p>
                  </div>

                  <button
                    onClick={() => handleVote(c.id, c.name)}
                    disabled={isProcessing}
                    className={styles.voteButton}
                  >
                    {isProcessing ? "Menyimpan Suara..." : "Berikan Suara"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <footer className={styles.footer}>
        &copy; 2024 Panitia Pemilihan Ketua OSIS
      </footer>
    </div>
  );
}
