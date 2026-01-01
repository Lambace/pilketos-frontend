"use client";
import { useEffect, useState } from "react";
import styles from "./login.module.css";
import { login } from "../../lib/api";

export default function LoginPage() {
  const [showGolput, setShowGolput] = useState(true);
  const [nisn, setNisn] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGolput(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validasi input di sisi client
    if (nisn.length !== 10) {
      setError("NISN harus 10 digit");
      setLoading(false);
      return;
    }

    try {
      // ✅ Memanggil API login dari lib/api.ts
      const data = await login(nisn);

      // ✅ Cek apakah login berhasil berdasarkan response backend
      // Menangani berbagai format response (data.success atau keberadaan nisn dalam data)
      if (data && (data.success === true || data.nisn)) {
        
        // ✅ Simpan NISN ke localStorage untuk session voting
        localStorage.setItem("nisn", nisn);

        // ✅ Redirect paksa ke halaman voting
        // Gunakan window.location agar browser benar-benar berpindah halaman
        window.location.href = "/voting";
        
      } else {
        // Tampilkan pesan error dari backend jika ada
        setError(data.message || "NISN tidak terdaftar atau salah.");
      }
    } catch (err: any) {
      // Tangkap pesan error dari apiFetch di api.ts
      setError(err.message || "⚠️ Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContent}>
      <div className={styles.headerContainer}>
        {showGolput ? (
          <img src="/golput.png" alt="Golput" className={`${styles.golput} ${styles.fadeOut}`} />
        ) : (
          <>
            <img
              src="/logo-vote.png"
              alt="Logo OSIS"
              className={`${styles.logoGlow} ${styles.fadeIn} ${styles.delay1}`}
            />
            <h1 className={`${styles.fadeIn} ${styles.delay2}`}>PEMILIHAN KETUA OSIS</h1>
            <h2 className={`${styles.fadeIn} ${styles.delay3}`}>SMK NEGERI 2 KOLAKA</h2>
          </>
        )}
      </div>

      {!showGolput && (
        <form onSubmit={handleLogin} className={`${styles.loginForm} ${styles.fadeIn} ${styles.delay4}`}>
          <input
            type="number" // Menggunakan type number untuk memudahkan input angka di HP
            placeholder="Masukkan 10 digit NISN"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} style={{ cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Mengecek NISN..." : "Masuk ke Ruang Suara"}
          </button>
          
          {error && (
            <div style={{ 
              marginTop: "15px", 
              padding: "10px", 
              backgroundColor: "rgba(255,0,0,0.1)", 
              borderRadius: "5px",
              border: "1px solid red"
            }}>
              <p style={{ color: "red", fontSize: "14px", margin: 0 }}>{error}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
