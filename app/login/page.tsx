"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const [showGolput, setShowGolput] = useState(true);
  const [nisn, setNisn] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setShowGolput(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (nisn.length !== 10) {
      setError("NISN harus 10 digit");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/validate-nisn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
      } else {
        // ✅ simpan NISN ke localStorage
        localStorage.setItem("nisn", nisn);

        // redirect ke voting
        router.push("/voting");
      }
    } catch {
      setError("⚠️ Tidak bisa menghubungi server.");
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
            type="text"
            placeholder="Masukkan NISN"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}
