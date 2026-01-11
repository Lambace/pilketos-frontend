"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "../lib/api";

export default function Home() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        console.log("Data dari API:", data); // Debugging

        // Pastikan kita mendapatkan objek, bukan array kosong
        const s = Array.isArray(data) ? data[0] : data;

        // Jika data ada (tidak null/undefined)
        if (s && Object.keys(s).length > 0) {
          setSettings(s);
          if (s.voting_open === true || s.voting_open === 1) {
            router.push("/login");
          }
        } else {
          // JIKA API BERHASIL TAPI DATA KOSONG DI DATABASE
          throw new Error("Data settings kosong di database");
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);

        // GUNAKAN DATA CADANGAN (FALLBACK) AGAR TIDAK MUNCUL ERROR 404/GAGAL
        setSettings({
          nama_sekolah: "NAMA SEKOLAH BELUM DIATUR",
          tahun_pelajaran: "2024/2025",
          warna_tema: "#2563eb",
          voting_status: "closed",
          tempat_pelaksanaan: "Belum diatur"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <div className="loader"></div> {/* Anda bisa tambahkan CSS loader nanti */}
        <p>Memuat konfigurasi sistem...</p>
      </div>
    );
  }

  // Bagian ini sekarang hampir tidak mungkin kena jika Catch sudah ada Fallback
  if (!settings) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <p>⚠️ Sistem sedang dalam pemeliharaan.</p>
        <button onClick={() => window.location.reload()} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: settings.warna_tema || "#2563eb", textTransform: "uppercase" }}>
        PEMILIHAN KETUA OSIS <br />
        {settings.nama_sekolah}
      </h1>

      <div
        style={{
          padding: "30px",
          border: `2px solid ${settings.warna_tema || "#ccc"}`,
          display: "inline-block",
          borderRadius: "12px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}
      >
        <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }}>
          Voting Belum Dibuka ⚠️
        </p>
        <p style={{ color: "#666" }}>Tahun Pelajaran: {settings.tahun_pelajaran}</p>
        <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "10px" }}>
          Lokasi: {settings.tempat_pelaksanaan || "Sekolah"}
        </p>
      </div>

      <footer style={{ marginTop: "50px", color: "#aaa", fontSize: "0.8rem" }}>
        <p>© {settings.tahun_pelajaran} {settings.nama_sekolah}</p>
      </footer>
    </div>
  );
}