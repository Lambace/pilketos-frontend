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

const API_URL = "https://voting-backend-production-ea29.up.railway.app"; 

export default function HasilVotePage() {
  const [results, setResults] = useState<{ id: number; name: string; suara: number }[]>([]);
  const [winner, setWinner] = useState<{ id: number | null; name: string; suara: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCleanMode, setIsCleanMode] = useState(false);

  const fetchData = async () => {
    try {
      const resResults = await fetch(`${API_URL}/results`);
      const dataResults = await resResults.json();
      // Pastikan backend mengembalikan field 'suara' atau sesuaikan dengan 'vote_count'
      const formatted = Array.isArray(dataResults) ? dataResults : [];
      setResults(formatted);

      const resWinner = await fetch(`${API_URL}/results/winner`);
      if (resWinner.ok) {
        const dataWinner = await resWinner.json();
        setWinner(dataWinner?.suara > 0 ? dataWinner : null);
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

  const chartData = {
    labels: results.map((r) => r.name),
    datasets: [
      {
        label: "Jumlah Suara",
        data: results.map((r) => r.suara),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", 
          "rgba(59, 130, 246, 0.8)", 
          "rgba(245, 158, 11, 0.8)", 
          "rgba(239, 68, 68, 0.8)", 
          "rgba(139, 92, 246, 0.8)"
        ],
        borderColor: "#ffffff",
        borderWidth: 1,
        borderRadius: 12,
        hoverBackgroundColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "PROGRESS PEROLEHAN SUARA (REAL-TIME)",
        color: "#ffffff",
        font: { size: 22, weight: 'bold' as const },
        padding: { bottom: 30 }
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleFont: { size: 16 },
        bodyFont: { size: 14 },
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#888", font: { size: 14 }, stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#ffffff", font: { size: 14, weight: 'bold' as const } }
      }
    }
  };

  return (
    <div className={styles.pageWrapper} style={{ backgroundColor: '#0f0f0f', minHeight: '100vh', color: '#fff', overflowX: 'hidden' }}>
      
      {/* --- HEADER --- */}
      {!isCleanMode && (
        <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', backgroundColor: '#181818', borderBottom: '1px solid #222' }}>
          <Link href="/admin" style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', color: '#fff', border: '1px solid #333', borderRadius: '8px', backgroundColor: '#222' }}>
            ⬅ Dashboard Admin
          </Link>
          <h1 style={{ fontSize: '20px', margin: 0, flexGrow: 1, textAlign: 'center', letterSpacing: '2px' }}>
            E-VOTING SYSTEM MONITOR
          </h1>
          <div style={{ width: '150px' }}></div>
        </header>
      )}

     {/* --- GRID LAYOUT --- */}
<div style={{ 
  display: 'flex', 
  flexWrap: 'wrap', 
  gap: '20px', 
  padding: isCleanMode ? '40px' : '15px',
  maxWidth: '1800px',
  margin: '0 auto',
  boxSizing: 'border-box'
}}>
  
  {/* KOLOM KIRI (Tabel & Winner) */}
  <div style={{ 
    // Di Desktop: flex-grow 1 (25%), di Mobile: lebar 100%
    flex: '1 1 300px', 
    width: '100%', 
    maxWidth: isCleanMode ? (typeof window !== 'undefined' && window.innerWidth < 992 ? '100%' : '350px') : '100%',
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  }}>
    {/* Isi Tabel & Winner Card tetap muncul di sini */}
    <div className={styles.tableCard} style={{ backgroundColor: '#181818', padding: '20px', borderRadius: '16px', border: '1px solid #222' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#aaa' }}>Detail Suara</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px 0', fontSize: '15px' }}>{r.name}</td>
                <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>{r.suara}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>

    {winner && (
       <div className={styles.winnerCard}>
          {/* ... konten winner ... */}
       </div>
    )}
  </div>

  {/* KOLOM KANAN (Grafik) */}
  <div style={{ 
    // Di Desktop: flex-grow 3 (75%), di Mobile: lebar 100%
    flex: '3 1 600px', 
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  }}>
    <div className={styles.chartWrapper} style={{ 
      backgroundColor: '#181818', 
      padding: '20px', 
      borderRadius: '16px', 
      border: '1px solid #222',
      height: isCleanMode ? '70vh' : '450px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {loading ? <p>Loading...</p> : <Bar data={chartData} options={chartOptions} />}
    </div>

    <button onClick={() => setIsCleanMode(!isCleanMode)} className={styles.btnClear} style={{ width: '100%' }}>
      {isCleanMode ? "👁️ Tampilkan Navigasi" : "🧹 Bersihkan Tampilan"}
    </button>
  </div>
</div>
      {!isCleanMode && (
        <footer style={{ textAlign: 'center', padding: '40px', color: '#333', fontSize: '12px', letterSpacing: '1px' }}>
          SMKN 2 KOLAKA • E-VOTING ENGINE v2.0 • 2026
        </footer>
      )}
    </div>
  );
}
