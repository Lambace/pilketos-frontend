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

// ✅ SINKRONISASI URL BACKEND RAILWAY
const API_URL = "https://voting-backend-production-ea29.up.railway.app"; 

export default function HasilVotePage() {
  const [results, setResults] = useState<{ id: number; name: string; suara: number }[]>([]);
  const [winner, setWinner] = useState<{ id: number | null; name: string; suara: number } | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Ambil Hasil Perolehan Suara
      const resResults = await fetch(`${API_URL}/results`);
      const dataResults = await resResults.json();
      const formattedResults = Array.isArray(dataResults) ? dataResults : [];
      setResults(formattedResults);

      // 2. Ambil Pemenang
      const resWinner = await fetch(`${API_URL}/results/winner`);
      if (resWinner.ok) {
        const dataWinner = await resWinner.json();
        if (dataWinner && dataWinner.suara > 0) {
          setWinner(dataWinner);
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetResults = () => {
    if(confirm("Ini hanya meriset tampilan sementara di layar ini. Data asli di database tetap aman.")) {
        const resetData = results.map((r) => ({ ...r, suara: 0 }));
        setResults(resetData);
        setWinner(null);
        setStatus("Tampilan direset secara lokal ⚠️");
        setTimeout(() => setStatus(""), 3000);
    }
  };

  const chartData = {
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "GRAFIK REAL-TIME QUICK COUNT",
        color: "#ffffff",
        font: { size: 18, weight: 'bold' as const }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#ffffff", stepSize: 1 }
      },
      x: {
        ticks: { color: "#ffffff", font: { weight: 'bold' as const } }
      }
    }
  };

  return (
    <div className={styles.pageWrapper} style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      {/* --- HEADER --- */}
      <header className={styles.topBar} style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', backgroundColor: '#222', borderBottom: '1px solid #333' }}>
        <Link 
          href="/admin" 
          style={{ 
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 'bold',
            textDecoration: 'none',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            zIndex: 10 // Memastikan tombol di lapisan atas
          }}
        >
          ⬅ Kembali ke Admin
        </Link>

        <h1 style={{ fontSize: '20px', margin: 0, flexGrow: 1, textAlign: 'center', color: '#fff' }}>
          Grafik Perolehan Suara
        </h1>
        <div style={{ width: '120px' }}></div> {/* Spacer agar judul tetap tengah */}
      </header>

      {/* --- MAIN CONTENT --- */}
      <div className={styles.layout} style={{ padding: '20px' }}>
        <div className={styles.leftCol}>
          <div className={styles.logoBox}>
            <img src="/logo-osis.png" alt="Logo OSIS" className={styles.logoLeft} style={{ width: '80px' }} />
          </div>

          <h2 className={styles.title} style={{ color: '#fff' }}>Tabel Perolehan</h2>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama Kandidat</th>
                <th>Suara</th>
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
                  <td colSpan={2} style={{ textAlign: 'center', color: '#ccc' }}>
                    {loading ? "Sinkronisasi..." : "Belum ada data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className={styles.infoBox}>
            {winner ? (
              <div className={styles.winnerCard}>
                <p>🏆 Unggul Sementara:</p>
                <h3>{winner.name}</h3>
                <div className={styles.badge}>{winner.suara} Suara</div>
              </div>
            ) : (
              <div className={styles.noDataCard}>
                <p>Belum ada suara masuk</p>
              </div>
            )}
          </div>

          <button onClick={handleResetResults} className={`${styles.button} ${styles.buttonDanger}`}>
            🧹 Bersihkan Tampilan
          </button>
          {status && <p className={styles.message} style={{ color: '#f59e0b' }}>{status}</p>}
        </div>

        <div className={styles.rightCol}>
          <div className={styles.chartWrapper} style={{ height: '400px', backgroundColor: '#222', padding: '20px', borderRadius: '12px' }}>
            {loading ? (
              <p style={{ color: '#fff' }}>Memuat Grafik...</p>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>

      <footer className={styles.footerResult} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        E-Voting SMKN 2 KOLAKA &copy; 2026
      </footer>
    </div>
  );
}