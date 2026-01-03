"use client";
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

// SESUAIKAN DENGAN URL BACKEND RAILWAY ANDA
const API_URL = "https://backend-produksi-anda.railway.app"; 

export default function HasilVotePage() {
  const [results, setResults] = useState<{ id: number; name: string; suara: number }[]>([]);
  const [winner, setWinner] = useState<{ id: number | null; name: string; suara: number } | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil Hasil Perolehan Suara
        const resResults = await fetch(`${API_URL}/results`);
        const dataResults = await resResults.json();
        const formattedResults = Array.isArray(dataResults) ? dataResults : [];
        setResults(formattedResults);

        // 2. Tentukan Pemenang secara otomatis dari data results
        if (formattedResults.length > 0) {
          const sorted = [...formattedResults].sort((a, b) => b.suara - a.suara);
          // Cek jika suara terbanyak adalah 0
          if (sorted[0].suara > 0) {
            setWinner({
              id: sorted[0].id,
              name: sorted[0].name,
              suara: sorted[0].suara,
            });
          } else {
            setWinner(null);
          }
        }
      } catch (err) {
        console.error("⚠️ Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Update data setiap 5 detik secara otomatis (Quick Count)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fungsi Reset Hasil (Hanya UI, untuk Reset permanen gunakan tombol di Admin)
  const handleResetResults = () => {
    if(confirm("Ini hanya meriset tampilan sementara. Data di server tetap ada. Lanjutkan?")) {
        const resetData = results.map((r) => ({ ...r, suara: 0 }));
        setResults(resetData);
        setWinner(null);
        setStatus("Tampilan berhasil direset secara lokal ⚠️");
    }
  };

  const chartData = {
    labels: results.map((r) => r.name),
    datasets: [
      {
        label: "Jumlah Suara",
        data: results.map((r) => r.suara),
        backgroundColor: [
          "#22c55e", // Hijau
          "#3b82f6", // Biru
          "#f59e0b", // Kuning
          "#ef4444", // Merah
          "#8b5cf6", // Ungu
          "#14b8a6", // Teal
        ],
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Grafik Perolehan Suara Real-Time",
        color: "#ffffff",
        font: { size: 16 }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#ffffff", stepSize: 1 }
      },
      x: {
        ticks: { color: "#ffffff" }
      }
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <Link href="/admin" className={`${styles.button} ${styles.buttonPrimary}`}>
          Kembali ke Admin
        </Link>
        <h1 className={styles.headerTitle}>Laporan E-Voting</h1>
      </header>

      <div className={styles.layout}>
        {/* Kolom kiri: Tabel & Info */}
        <div className={styles.leftCol}>
          <div className={styles.logoBox}>
            <img src="/logo-osis.png" alt="Logo OSIS" className={styles.logoLeft} />
          </div>

          <h2 className={styles.title}>Data Perolehan</h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kandidat</th>
                <th>Total Suara</th>
              </tr>
            </thead>
            <tbody>
              {results.length > 0 ? (
                results.map((r, index) => (
                  <tr key={r.id ?? index}>
                    <td>{r.name}</td>
                    <td className={styles.count}>{r.suara}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2}>Memuat data...</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className={styles.infoBox}>
            {winner && winner.suara > 0 ? (
              <div className={styles.winnerCard}>
                <p>🎉 Unggul Sementara:</p>
                <h3>{winner.name}</h3>
                <span className={styles.badge}>{winner.suara} Suara</span>
              </div>
            ) : (
              <p className={styles.noData}>Belum ada suara masuk.</p>
            )}
          </div>

          <button
            onClick={handleResetResults}
            className={`${styles.button} ${styles.buttonDanger}`}
          >
            Bersihkan Tampilan
          </button>

          {status && <p className={styles.message}>{status}</p>}
        </div>

        {/* Kolom kanan: Grafik */}
        <div className={styles.rightCol}>
          <div className={styles.chartWrapper}>
            {loading ? (
              <p>Menghubungkan ke server...</p>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
