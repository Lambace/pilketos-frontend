"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "../lib/api"; // Gunakan @/ untuk path absolut atau sesuaikan path-nya

export default function Home() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        // Backend biasanya mengirim array, ambil index pertama
        const s = Array.isArray(data) ? data[0] : data;

        if (s) {
          setSettings(s);

          // Logika otomatis: Jika voting dibuka, langsung ke login
          if (s.voting_status === "open" || s.voting_status === 1) {
            router.push("/login");
          }
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    // Hapus [API_URL] dari sini. Cukup gunakan array kosong [] 
    // agar pengecekan hanya jalan 1x saat halaman dibuka.
  }, [router]);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Memuat halaman...</div>;
  }

  if (!settings) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Gagal memuat konfigurasi sistem.</div>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "sans-serif" }}>
      <h1 style={{ color: settings.warna_tema || "#2563eb" }}>
        PEMILIHAN KETUA OSIS <br />
        {settings.nama_sekolah?.toUpperCase()}
      </h1>

      <div
        style={{
          padding: "30px",
          border: `2px solid ${settings.warna_tema || "#ccc"}`,
          display: "inline-block",
          borderRadius: "12px",
          backgroundColor: "#f9f9f9",
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