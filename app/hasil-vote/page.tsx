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
  flexWrap: 'wrap', // Memungkinkan kolom turun ke bawah saat layar sempit
  gap: '30px', 
  padding: isCleanMode ? '40px' : '20px',
  maxWidth: '100%', 
  margin: '0 auto',
  boxSizing: 'border-box'
}}>
  
  {/* KOLOM KIRI (25% di Desktop, 100% di Mobile) */}
  <div style={{ 
    flex: '1 1 300px', 
    width: '100%', // Memastikan lebar penuh di layar kecil
    maxWidth: isCleanMode ? '350px' : '400px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  }}>
    {/* ... Isi Tabel & Winner Card ... */}
  </div>

  {/* KOLOM KANAN (75% di Desktop, 100% di Mobile) */}
  <div style={{ 
    flex: '3 1 600px', 
    width: '100%', // Penyelamat: Memastikan lebar kolom sama dengan grafik di HP
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  }}>
    <div className={styles.chartWrapper} style={{ 
      backgroundColor: '#181818', 
      padding: '20px', 
      borderRadius: '16px', 
      border: '1px solid #222',
      height: isCleanMode ? '80vh' : '450px',
      width: '100%', // Menjamin grafik mengisi seluruh ruang kolom
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {loading ? (
        <div style={{ color: '#555', textAlign: 'center', paddingTop: '100px' }}>Menghubungkan...</div>
      ) : (
        <Bar data={chartData} options={chartOptions} />
      )}
    </div>

    {/* Tombol Clean Mode juga akan mengikuti lebar grafik */}
    <button 
      onClick={() => setIsCleanMode(!isCleanMode)} 
      className={styles.btnClear}
      style={{ width: '100%', alignSelf: 'stretch' }}
    >
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
