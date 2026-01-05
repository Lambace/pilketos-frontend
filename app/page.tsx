"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  // 1. Tambahkan state untuk menyimpan identitas lengkap
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("https://voting-backend-production-ea29.up.railway.app/settings", {
          cache: 'no-store'
        });

        if (!res.ok) throw new Error("Gagal ambil data");

        const data = await res.json();
        setSettings(data); // Simpan semua data (nama sekolah, tahun, warna)

      } catch (err) {
        console.error("Gagal koneksi ke API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // 2. Proses Redirect jika voting terbuka
  useEffect(() => {
    if (!loading && settings?.voting_open === true) {
      router.push("/login");
    }
  }, [loading, settings, router]);

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <p>Memvalidasi Status Voting...</p>
    </div>
  );

  // Jika voting terbuka, jangan tampilkan apa-apa (karena mau redirect)
  if (settings?.voting_open === true) return null;

  return (
    <div style={{
      textAlign: "center",
      marginTop: "50px",
      fontFamily: "sans-serif"
    }}>
      {/* NAMA SEKOLAH & TAHUN DINAMIS */}
      <h1 style={{ color: settings?.warna_tema || "#2563eb" }}>
        PEMILIHAN KETUA OSIS <br />
        {settings?.nama_sekolah?.toUpperCase()}
      </h1>

      <div style={{
        padding: "30px",
        border: `2px solid ${settings?.warna_tema || "#ccc"}`,
        display: "inline-block",
        borderRadius: "12px",
        backgroundColor: "#f9f9f9"
      }}>
        <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#333" }}>
          Voting Belum Dibuka ⚠️
        </p>
        <p style={{ color: "#666" }}>
          Tahun Pelajaran: {settings?.tahun_pelajaran}
        </p>
        <p style={{ color: "#888", fontSize: "0.9rem", marginTop: "10px" }}>
          Lokasi: {settings?.tempat_pelaksanaan}
        </p>
      </div>

      {/* FOOTER DINAMIS */}
      <footer style={{ marginTop: "50px", color: "#aaa", fontSize: "0.8rem" }}>
        <p>© {settings?.tahun_pelajaran} {settings?.nama_sekolah}</p>
      </footer>
    </div>
  );
}