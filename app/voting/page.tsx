"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";
// Pastikan path ini sesuai dengan struktur folder Anda
import { getSettings, getCandidates } from "../../lib/api";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // State untuk settings dinamis
  const [appSettings, setAppSettings] = useState({
    nama_sekolah: "Panitia Pemilihan",
    logo_url: "",
    warna_tema: "#007bff", // Default biru jika belum dimuat
  });

  useEffect(() => {
    const nisn = localStorage.getItem("nisn");
    if (!nisn) {
      alert("Akses ditolak. Silakan login terlebih dahulu.");
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Mengambil data Kandidat dan Settings secara paralel (bersamaan)
        const [candData, settData] = await Promise.all([
          getCandidates(),
          getSettings()
        ]);

        // Set Data Kandidat
        if (candData) {
          const data = Array.isArray(candData) ? candData : [];
          console.log("Daftar Path Foto:", data.map(c => ({ nama: c.name, path: c.photo })));
          setCandidates(data);
        }
        // Set Data Settings
        if (settData) {
          const s = Array.isArray(settData) ? settData[0] : settData;
          if (s) {
            setAppSettings({
              nama_sekolah: s.nama_sekolah || "Panitia Pemilihan",
              logo_url: s.logo_url || "",
              warna_tema: s.warna_tema || "#007bff",
            });
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

      if (res.ok) {
        alert("✅ Berhasil menyimpan suara! Terima kasih telah berpartisipasi.");
        localStorage.clear();
        router.push("/login");
      } else {
        const data = await res.json();
        alert("❌ Gagal: " + (data.error || "Terjadi kesalahan."));
        localStorage.clear();
        router.push("/login");
      }
    } catch (err) {
      alert("⚠️ Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={styles.voteContent}
      style={{ '--primary-color': appSettings.warna_tema } as any}
    >
      {/* LOGO DINAMIS */}
      <img
        src={appSettings.logo_url ? `${API_URL}${appSettings.logo_url}` : "/logo-putih.png"}
        alt="Logo Sekolah"
        className={styles.logo}
        onError={(e) => (e.currentTarget.src = "/logo-putih.png")}
      />

      <h1>SILAHKAN PILIH KANDIDAT ANDA !!!</h1>

      {/* SUBTITLE DINAMIS (Menampilkan Nama Sekolah) */}
      <p className={styles.subtitle}>
       
        Gunakan hak suara Anda secara bijak, jujur, dan adil.
      </p>

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
                      <div
                        className={styles.nomorBadge}
                        style={{ backgroundColor: appSettings.warna_tema }}
                      >
                        {String(c.nomor_urut || 0).padStart(2, '0')}
                      </div>
                      <img
                        src={(() => {
                          if (!c.photo) return "/logo-osis.png";

                          // 1. Ambil nama file aslinya (buang semua folder di depannya)
                          // Contoh: "/upload/candidates/123.jpg" -> "123.jpg"
                          // Contoh: "candidates/123.jpg" -> "123.jpg"
                          const parts = c.photo.split('/');
                          const fileName = parts[parts.length - 1];

                          // 2. Rakit URL sesuai konfigurasi backend: /upload/candidates/
                          return `${API_URL}/upload/candidates/${fileName}`;
                        })()}
                        alt={c.name}
                        className={styles.photo}
                        onError={(e) => {
                          // Jika masih gagal (mungkin file tidak ada di subfolder candidates)
                          // Coba langsung di folder /upload/
                          const target = e.currentTarget;
                          const fileName = c.photo.split('/').pop();
                          const fallbackUrl = `${API_URL}/upload/${fileName}`;

                          if (target.src !== fallbackUrl && !target.dataset.tried) {
                            target.dataset.tried = "true";
                            target.src = fallbackUrl;
                          } else {
                            target.src = "/logo-osis.png";
                          }
                        }}
                      />
                    </div>
                    <div className={styles.info}>
                      <h2>{c.name}</h2>
                      <button
                        onClick={() => handleVote(c.id, c.name)}
                        disabled={isProcessing}
                        className={styles.voteButton}
                        style={{ backgroundColor: appSettings.warna_tema }}
                      >
                        {isProcessing ? "Menyimpan..." : "Berikan Suara"}
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* FOOTER DINAMIS (Tahun Otomatis & Nama Sekolah dari DB) */}
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} {appSettings.nama_sekolah}
      </footer>
    </div>
  );
}