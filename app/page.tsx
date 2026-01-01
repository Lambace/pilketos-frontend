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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`);
        const data = await res.json();
        setStatus(Boolean(data.voting_open));
      } catch (err) {
        console.error("Error cek status voting:", err);
        setStatus(false);
      } finally {
        setLoading(false);
      }
    };
    checkVotingStatus();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (status) {
    // ✅ kalau voting sudah dibuka, redirect ke login
    router.push("/login");
    return null;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>PEMILIHAN KETUA OSIS</h1>
      <p>Voting belum dibuka ⚠️</p>
    </div>
  );
}
