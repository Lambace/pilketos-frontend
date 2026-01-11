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
import { getStudents, getCandidates } from "../../lib/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function HasilVotePage() {
  const [results, setResults] = useState<{ id: number; name: string; suara: number }[]>([]);
  const [totalDpt, setTotalDpt] = useState(0);
  const [winner, setWinner] = useState<{ id: number | null; name: string; suara: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCleanMode, setIsCleanMode] = useState(false);

  const fetchData = async () => {
    try {
      // 1. Fetch data dari endpoint results dan students secara paralel
      // Menggunakan cache: 'no-store' dan timestamp agar data selalu fresh (Real-time)
      const timestamp = new Date().getTime();
      const [resResults, resStudents] = await Promise.all([
        fetch(`${API_URL}/results?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`${API_URL}/students?t=${timestamp}`, { cache: 'no-store' })
      ]);

      const dataResults = await resResults.json();
      const dataStudents = await resStudents.json();

      // Set Total DPT dari jumlah baris tabel students
      if (Array.isArray(dataStudents)) {
        setTotalDpt(dataStudents.length);
      }

      // 2. Normalisasi Data Hasil
      // Backend bisa mengirim 'suara' atau 'votes_count', kita handle keduanya
      const formatted = Array.isArray(dataResults) ? dataResults : [];
      const normalizedData = formatted.map((item: any) => {
        const perolehanSuara =
          item.suara !== undefined ? item.suara :
            item.votes_count !== undefined ? item.votes_count : 0;

        return {
          id: item.id,
          name: item.name || "Kandidat",
          suara: Number(perolehanSuara)
        };
      });

      setResults(normalizedData);

      // 3. Logika Penentuan Pemenang (Berdasarkan suara tertinggi)
      if (normalizedData.length > 0) {
        const sorted = [...normalizedData].sort((a, b) => b.suara - a.suara);
        const top = sorted[0];

        // Set pemenang jika suara terbanyak lebih dari 0
        if (top.suara > 0) {
          setWinner(top);
        } else {
          setWinner(null);
        }
      }
    } catch (err) {
      console.error("⚠️ Gagal sinkronisasi data real-time:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Interval refresh 5 detik untuk monitor live
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hitung Total Suara Masuk dari seluruh kandidat
  const totalSuaraMasuk = results.reduce((acc, curr) => acc + curr.suara, 0);

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
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `TOTAL SUARA: ${totalSuaraMasuk} / ${totalDpt} PEMILIH`,
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
        ticks: {
          color: "#888",
          font: { size: 14 },
          stepSize: 1 // Memastikan skala y menggunakan angka bulat
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: "#ffffff", font: { size: 14, weight: 'bold' as const } }
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>

      {/* --- HEADER --- */}
      {!isCleanMode && (
        <header className={styles.topBar}>
          <Link href="/admin" className={styles.btnAdmin}>
            ⬅ Dashboard Admin
          </Link>
          <h1 className={styles.mainTitle}>
            E-VOTING SYSTEM MONITOR
          </h1>
          <div style={{ width: '150px' }}></div>
        </header>
      )}

      {/* --- GRID LAYOUT --- */}
      <div className={styles.layout} style={{ padding: isCleanMode ? '40px' : '20px' }}>

        {/* KOLOM KIRI (Tabel & Winner) */}
        <div className={styles.leftCol} style={{ maxWidth: isCleanMode ? '400px' : 'none' }}>

          {/* WINNER CARD */}
          {winner ? (
            <div className={styles.winnerCard}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>
                🏆 UNGGUL SEMENTARA
              </p>
              <h2 className={styles.winnerName}>{winner.name}</h2>
              <div className={styles.badge}>
                {winner.suara} SUARA
              </div>
            </div>
          ) : (
            <div className={styles.winnerCard} style={{ background: '#181818', border: '1px dashed #444' }}>
              <p style={{ color: '#666', margin: 0 }}>Belum ada suara masuk</p>
            </div>
          )}

          {/* TABEL DETAIL */}
          <div className={styles.tableCard}>
            <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#aaa' }}>Detail Perolehan</h2>
            <table className={styles.table}>
              <tbody>
                {results.map((r) => {
                  const persentase = totalSuaraMasuk > 0
                    ? ((r.suara / totalSuaraMasuk) * 100).toFixed(1)
                    : 0;
                  return (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td className={styles.count}>
                        {r.suara} Suara <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>({persentase}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN (Grafik) */}
        <div className={styles.rightCol}>
          <div className={styles.chartWrapper} style={{ height: isCleanMode ? '75vh' : '500px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px', color: '#666' }}>Menghubungkan ke server...</div>
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </div>

          <button onClick={() => setIsCleanMode(!isCleanMode)} className={styles.btnClear}>
            {isCleanMode ? "👁️ Tampilkan Navigasi" : "🧹 Bersihkan Tampilan"}
          </button>
        </div>
      </div>

      {!isCleanMode && (
        <footer className={styles.footerResult}>
          SMKN 2 KOLAKA • E-VOTING ENGINE v2.0 • 2026
        </footer>
      )}
    </div>
  );
}