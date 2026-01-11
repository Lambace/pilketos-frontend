"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Ambil URL backend dari .env.local
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Panggil endpoint /settings, bukan root /
        const res = await fetch(`${API_URL}/settings`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Endpoint tidak ditemukan atau server error");
          return;
        }

        const data = await res.json();

        // Handle jika data berupa array
        setSettings(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        console.error("Gagal koneksi ke API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  // Redirect ke /login jika voting terbuka
  useEffect(() => {
    if (!loading && settings?.voting_open === true) {
      router.push("/login");
    }
  }, [loading, settings, router]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>Memvalidasi Status Voting...</p>
      </div>
    );

  if (settings?.voting_open === true) return null;

  if (!settings)
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p>⚠️ Gagal terhubung ke database. Pastikan backend aktif.</p>
        <button onClick={() => window.location.reload()}>Coba Lagi</button>
      </div>
    );

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
