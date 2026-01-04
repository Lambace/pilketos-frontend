"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ FUNGSI OTOMATIS: Mengubah link Drive biasa menjadi Direct Link Gambar
  const getDirectLink = (url: string) => {
  if (!url) return "/logo-osis.png";
  console.log("URL Gambar Asli:", url); // Tambahkan ini untuk cek di F12 (Console)
  
  if (url.includes("drive.google.com")) {
    const fileId = url.split("/d/")[1]?.split("/")[0] || url.split("id=")[1]?.split("&")[0];
    if (fileId) {
      const result = `https://drive.google.com/uc?export=view&id=${fileId}`;
      console.log("Direct Link Hasil Konversi:", result);
      return result;
    }
  }
  return url;
};

  useEffect(() => {
    const nisn = localStorage.getItem("nisn");
    if (!nisn) {
      alert("Akses ditolak. Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    const fetchCandidates = async () => {
      try {
        const res = await fetch(`${API_URL}/candidates`);
        if (!res.ok) throw new Error("Gagal mengambil data kandidat");
        const data = await res.json();
        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Gagal memuat daftar kandidat.");
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

      const data = await res.json();
      if (res.ok) {
        alert("✅ Berhasil menyimpan suara!");
        localStorage.clear();
        router.push("/login"); 
      } else {
        alert("❌ Gagal: " + (data.error || "Terjadi kesalahan."));
        localStorage.clear();
        router.push("/login");
      }
    } catch (err) {
      alert("⚠️ Terjadi kesalahan koneksi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.voteContent}>
      <img src="/logo-osis.png" alt="Logo OSIS" className={styles.logo} />
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
               <div className={styles.imageWrapper} style={{ width: '100%', height: '250px', position: 'relative', overflow: 'hidden', backgroundColor: '#333' }}>
<img
    // Hasilnya: https://voting-backend-production-ea29.up.railway.app/upload/candidates/foto.jpg
    src={c.photo ? `${API_URL}${c.photo}` : "/logo-osis.png"}
    alt={c.name}
    className={styles.photo}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    onError={(e) => {
      // Jika gambar tetap gagal dimuat, pakai logo cadangan
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
