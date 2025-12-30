"use client";
import { useEffect, useState } from "react";
import styles from "./winner.module.css";
import { apiFetch } from "../../lib/api";
interface Winner {
  id: number;
  name: string;
  photo: string;
  vision: string;
  mission: string;
  total_votes: number;
}

export default function WinnerPage() {
  const [winner, setWinner] = useState<Winner | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/winner")
      .then((res) => res.json())
      .then((data) => setWinner(data))
      .catch(() => setError("⚠️ Tidak bisa ambil data pemenang"));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!winner) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.winnerContent}>
      <h1>Pemenang Pemilihan Ketua OSIS</h1>
      <div className={styles.card}>
        <img src={`/upload/${winner.photo}`} alt={winner.name} className={styles.photo} />
        <h2>{winner.name}</h2>
        <p><strong>Visi:</strong> {winner.vision}</p>
        <p><strong>Misi:</strong> {winner.mission}</p>
        <p className={styles.votes}>Total Suara: {winner.total_votes}</p>
      </div>
    </div>
  );
}
