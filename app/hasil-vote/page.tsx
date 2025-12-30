"use client";
import { apiFetch } from "../../lib/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./result.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HasilVotePage() {
  const [results, setResults] = useState<{ id: string; name: string; suara: number }[]>([]);
  const [winner, setWinner] = useState<{ id: string | null; name: string; suara: number } | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch results
        const resResults = await fetch("/results");
        const dataResults = await resResults.json();
        setResults(Array.isArray(dataResults) ? dataResults : []);

        // fetch winner
        const resWinner = await fetch("/winner");
        if (!resWinner.ok) throw new Error("Gagal fetch winner");
        let dataWinner: any = null; 
        try { 
          dataWinner = await resWinner.json(); 
        } catch { 
          dataWinner = { id: null, name: "Belum ada pemenang", suara: 0 }; 
        } 
        if (dataWinner && dataWinner.name) { 
          setWinner({ 
            id: dataWinner.id ?? null, 
            name: dataWinner.name, 
            suara: dataWinner.suara ?? 0, 
          }); 
          } else { 
            setWinner({ id: null, name: "Belum ada pemenang", suara: 0 }); 
          }
      } catch (err) {
        console.error("Gagal fetch data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetResults = () => {
    const resetData = results.map((r) => ({ ...r, suara: 0 }));
    setResults(resetData);
    setStatus("Semua hasil vote berhasil direset ⚠️");
  };

  const data = {
    labels: results.map((r) => r.name),
    datasets: [
      {
        label: "Jumlah Suara",
        data: results.map((r) => r.suara),
        backgroundColor: ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"],
        borderRadius: 8,
      },
    ],
  };

  const labelPlugin = {
    id: "labelPlugin",
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      ctx.save();
      chart.data.labels.forEach((label: string, i: number) => {
        const meta = chart.getDatasetMeta(0);
        const bar = meta.data[i];
        if (!bar) return;

        const x = bar.x;
        const y = bar.y + bar.height / 2 + 20;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, x, y);
      });
      ctx.restore();
    },
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <Link href="/admin" className={`${styles.button} ${styles.buttonPrimary}`}>
          Admin
        </Link>
      </header>

      <div className={styles.layout}>
        {/* Kolom kiri */}
        <div className={styles.leftCol}>
          <div className={styles.logoBox}>
            <img src="/logo-vote.png" alt="Logo OSIS" className={styles.logoLeft} />
          </div>

          <h2 className={styles.title}>Hasil Voting</h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kandidat</th>
                <th>Suara</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => (
                <tr key={r.id ?? index}>
                  <td>{r.name}</td>
                  <td>{r.suara}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.length > 0 && (
            <button
              onClick={handleResetResults}
              className={`${styles.button} ${styles.buttonDanger}`}
            >
              Reset Hasil
            </button>
          )}

          {status && <p className={styles.message}>{status}</p>}
        </div>

        {/* Kolom kanan */}
        <div className={styles.rightCol}>
          <div className={styles.chartWrapper}>
            <Bar data={data} options={{ plugins: { legend: { display: false } } }} plugins={[labelPlugin]} />
            {results.every((r) => r.suara === 0) && (
              <p className={styles.noData}>Belum ada data hasil vote</p>
            )}
            {winner && (
              <p className={styles.winner}>
                🎉 Pemenang: <strong>{winner.name}</strong> dengan {winner.suara} suara
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
