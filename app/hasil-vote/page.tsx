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

// GANTI DENGAN URL BACKEND RAILWAY ANDA
const API_URL = "https://backend-produksi-anda.railway.app"; 

export default function HasilVotePage() {
  const [results, setResults] = useState<{ id: number; name: string; suara: number }[]>([]);
  const [winner, setWinner] = useState<{ id: number | null; name: string; suara: number } | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // 1. Ambil Hasil Perolehan Suara dari rute /results (resultsRoutes)
      const resResults = await fetch(`${API_URL}/results`);
      const dataResults = await resResults.json();
      const formattedResults = Array.isArray(dataResults) ? dataResults : [];
      setResults(formattedResults);

      // 2. Ambil Pemenang dari rute /results/winner
      const resWinner = await fetch(`${API_URL}/results/winner`);
      if (resWinner.ok) {
        const dataWinner = await resWinner.json();
        // Hanya set winner jika suara > 0
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
    // Real-time update setiap 5 detik
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fungsi Reset Tampilan (Hanya di UI)
  const handleResetResults = () => {
    if(confirm("Ini hanya meriset tampilan sementara di layar ini. Data asli di database tetap aman. Lanjutkan?")) {
        const resetData = results.map((r) => ({ ...r, suara: 0 }));
        setResults(resetData);
        setWinner(null);
        setStatus("Tampilan direset secara lokal ⚠️");
        setTimeout(() => setStatus(""), 3000); // Hilangkan pesan setelah 3 detik
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
        text: "GRAFIK REAL-TIME QUICK COUNT",
        color: "#ffffff",
        font: { size: 18, weight: 'bold' as const }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` Suara: ${context.raw}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { 
          color: "#ffffff", 
          stepSize: 1,
          font: { size: 14 }
        }
      },
      x: {
        ticks: { 
          color: "#ffffff",
          font: { size: 14, weight: 'bold' as const }
        }
      }
    }
  };

  return (
   <header className={styles.topBar} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
  <Link 
    href="/admin" 
    style={{ 
      padding: '5px 12px',
      fontSize: '12px',
      fontWeight: '500',
      textDecoration: 'none',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.3)', // Garis tipis transparan
      borderRadius: '4px',
      backgroundColor: 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
  >
    ⬅ Admin
  </Link>
  
  <h1 className={styles.headerTitle} style={{ 
    fontSize: '18px', 
    margin: 0, 
    flexGrow: 1, 
    textAlign: 'center',
    opacity: 0.9 
  }}>
    Laporan E-Voting
  </h1>
  
  {/* Spacer di kanan agar judul tetap di tengah secara visual */}
  <div style={{ width: '80px' }}></div>
</header>
      <div className={styles.layout}>
        {/* Kolom kiri: Tabel & Info */}
        <div className={styles.leftCol}>
          <div className={styles.logoBox}>
            <img src="/logo-osis.png" alt="Logo OSIS" className={styles.logoLeft} />
          </div>

          <h2 className={styles.title}>Tabel Perolehan</h2>

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
                  <td colSpan={2} style={{ textAlign: 'center', padding: '20px' }}>
                    {loading ? "Menghubungkan ke server..." : "Belum ada data kandidat"}
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

          <button
            onClick={handleResetResults}
            className={`${styles.button} ${styles.buttonDanger}`}
          >
            🧹 Bersihkan Tampilan
          </button>

          {status && <p className={styles.message}>{status}</p>}
        </div>

        {/* Kolom kanan: Grafik */}
        <div className={styles.rightCol}>
          <div className={styles.chartWrapper}>
            {loading ? (
              <div className={styles.loadingChart}>
                 <p>Sinkronisasi Data...</p>
              </div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>
        </div>
      </div>
      
      <footer className={styles.footerResult}>
        Sistem E-Voting Real-Time &copy; 2024
      </footer>
    </div>
  );
}
