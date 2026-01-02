"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [status, setStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        // Gunakan URL Langsung jika process.env bermasalah
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://voting-backend-production-ea29.up.railway.app";
        
        const res = await fetch(`${apiUrl}/settings`, {
          cache: 'no-store'
        });

        // Cek jika response bukan JSON (misal error 404/500)
        if (!res.ok) {
          throw new Error("Gagal mengambil data dari server");
        }

        const data = await res.json();
        console.log("Data dari API:", data);

        // Pastikan status disetel berdasarkan voting_open
        setStatus(data.voting_open === true);
      } catch (err) {
        console.error("Error cek status voting:", err);
        setStatus(false);
      } finally {
        setLoading(false);
      }
    };
    checkVotingStatus();
  }, []);

  // Proses Redirect
  useEffect(() => {
    if (!loading && status === true) {
      router.push("/login");
    }
  }, [loading, status, router]);

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <p>Memvalidasi Status Voting...</p>
    </div>
  );

  if (status === true) return null; // Mencegah "flicker" konten sebelum redirect

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>PEMILIHAN KETUA OSIS</h1>
      <div style={{ padding: "20px", border: "1px solid #ccc", display: "inline-block", borderRadius: "8px" }}>
        <p style={{ fontSize: "1.2rem" }}>Voting belum dibuka ⚠️</p>
        <p style={{ color: "#666" }}>Silakan hubungi panitia untuk informasi lebih lanjut.</p>
      </div>
    </div>
  );
}
