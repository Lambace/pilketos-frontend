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
      // Kita panggil langsung URL-nya untuk memastikan
      const res = await fetch("https://voting-backend-production-ea29.up.railway.app/settings", {
        cache: 'no-store'
      });
      
      if (!res.ok) {
        console.error("Status Error:", res.status);
        setStatus(false);
        return;
      }

      const data = await res.json();
      console.log("Data diterima:", data);
      
      // Jika data.voting_open adalah true, maka setStatus(true)
      setStatus(data.voting_open === true);
    } catch (err) {
      console.error("Gagal koneksi ke API:", err);
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
