"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./vote.module.css";
// Menggunakan API_URL terpusat dari api.ts agar konsisten
import { getSettings, getCandidates, submitVote } from "../../lib/api";

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [appSettings, setAppSettings] = useState({
    nama_sekolah: "Panitia Pemilihan",
    logo_url: "",
    warna_tema: "#007bff",
  });

  useEffect(() => {
    const nisn = localStorage.getItem("nisn");

    if (!nisn) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [candData, settData] = await Promise.all([
          getCandidates(),
          getSettings()
        ]);

        if (candData) {
          setCandidates(Array.isArray(candData) ? candData : []);
        }

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
  }, [router]); // Kurung kurawal penutup useEffect tadi salah di sini

  const handleVote = async (candidateId: number, candidateName: string) => {
    const confirmVote = confirm(`Apakah Anda yakin memilih: ${candidateName}?`);
    if (!confirmVote) return;

    setIsProcessing(true);
    const nisn = localStorage.getItem("nisn") || "";

    try {
      // Menggunakan fungsi submitVote dari lib/api agar lebih bersih
      await submitVote(nisn, candidateId);

      alert("✅ Berhasil menyimpan suara! Terima kasih.");
      localStorage.clear();
      router.push("/login");
    } catch (err: any) {
      alert(`❌ Gagal: ${err.message}`);
      if (err.message.toLowerCase().includes("sudah memilih")) {
        localStorage.removeItem("nisn");
        router.push("/login");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={styles.voteContent}
      style={{ '--primary-color': appSettings.warna_tema } as any}
    >
      <img
        src={appSettings.logo_url || "/logo-putih.png"}
        alt="Logo Sekolah"
        className={styles.logo}
        onError={(e) => (e.currentTarget.src = "/logo-putih.png")}
      />

      <h1>SILAHKAN PILIH KANDIDAT ANDA !!!</h1>

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
                    src={c.photo || "/logo-osis.png"}
                    alt={c.name}
                    className={styles.photo}
                    onError={(e) => (e.currentTarget.src = "/logo-osis.png")}
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

      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} {appSettings.nama_sekolah}
      </footer>
    </div>
  );
}