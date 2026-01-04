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
  
  // State untuk mode "Clean Display" (Menyembunyikan UI Admin/Header)
  const [isCleanMode, setIsCleanMode] = useState(false);

  const fetchData = async () => {
    try {
      const resResults = await fetch(`${API_URL}/results`);
      const dataResults = await resResults.json();
      setResults(Array.isArray(dataResults) ? dataResults : []);

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
        font: { size: 20, weight: 'bold' as const }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#ffffff", stepSize: 1 }
      },
      x: {
        ticks: { color: "#ffffff", font: { size: 14, weight: 'bold' as const } }
      }
    }
  };

  return (
    <div className={styles.pageWrapper} style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#fff' }}>
      
      {/* --- HEADER (Disembunyikan jika Clean Mode) --- */}
      {!isCleanMode && (
        <header className={styles.topBar} style={{ padding: '15px 40px', display: 'flex', alignItems: 'center', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333' }}>
          <Link href="/admin" style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none', color: '#fff', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#2a2a2a' }}>
            ⬅ Kembali ke Admin
          </Link>
          <h1 style={{ fontSize: '24px', margin: 0, flexGrow: 1, textAlign: 'center' }}>
            📊 DASHBOARD HASIL E-VOTING
          </h1>
          <div style={{ width: '150px' }}></div>
        </header>
      )}

      {/* --- MAIN LAYOUT GRID --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '30px', 
        padding: isCleanMode ? '40px' : '20px',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        
        {/* KOLOM KIRI: Tabel & Winner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Logo & Info Perolehan */}
          <div style={{ backgroundColor: '#1e1e1e', padding: '25px', borderRadius: '16px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <img src="/logo-osis.png" alt="Logo" style={{ width: '60px', height: 'auto' }} />
              <h2 style={{ margin: 0, fontSize: '22px' }}>Tabel Perolehan Suara</h2>
            </div>

            <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '12px' }}>Nama Kandidat</th>
                  <th style={{ textAlign: 'right', padding: '12px' }}>Total Suara</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '15px 12px', fontSize: '18px' }}>{r.name}</td>
                    <td style={{ padding: '15px 12px', textAlign: 'right', fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{r.suara}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Winner Card */}
          {winner && (
            <div style={{ 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1e1e 100%)', 
              padding: '30px', 
              borderRadius: '16px', 
              border: '1px solid #2563eb',
              textAlign: 'center'
            }}>
              <p style={{ color: '#93c5fd', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px' }}>🏆 Unggul Sementara</p>
              <h3 style={{ fontSize: '32px', margin: '0 0 10px 0', color: '#fff' }}>{winner.name}</h3>
              <div style={{ display: 'inline-block', backgroundColor: '#2563eb', padding: '8px 25px', borderRadius: '50px', fontSize: '20px', fontWeight: 'bold' }}>
                {winner.suara} Suara
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Grafik & Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ 
            backgroundColor: '#1e1e1e', 
            padding: '25px', 
            borderRadius: '16px', 
            border: '1px solid #333',
            height: '500px' // Grafik lebih besar di desktop
          }}>
            {loading ? (
              <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Memuat data...</div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          {/* Tombol Clean Display di bawah grafik */}
          <button 
            onClick={() => setIsCleanMode(!isCleanMode)} 
            style={{ 
              width: '100%', 
              padding: '15px', 
              borderRadius: '12px', 
              backgroundColor: isCleanMode ? '#333' : '#dc2626', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isCleanMode ? "📺 Tampilkan Menu Admin" : "🧹 Bersihkan Tampilan (Mode Presentasi)"}
          </button>
        </div>

      </div>

      {!isCleanMode && (
        <footer style={{ textAlign: 'center', padding: '40px', color: '#555', fontSize: '14px' }}>
          E-Voting SMKN 2 KOLAKA &copy; 2026 | Real-time Data System
        </footer>
      )}
    </div>
  );
}
