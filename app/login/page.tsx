"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { login } from "../../lib/api";

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
      const data = await login(nisn);
      if (!data.success) {
        setError(data.message || "Login gagal");
      } else {
        localStorage.setItem("nisn", nisn);
        router.push("/voting");
      }
    } catch {
      setError("⚠️ Tidak bisa menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContent}>
        <div className={styles.headerContainer}>
          {showGolput ? (
            <img src="/golput.png" alt="Golput" className={`${styles.golput} ${styles.fadeOut}`} />
          ) : (
            <div className={styles.brandWrapper}>
              <img
                src="/logo-vote.png"
                alt="Logo OSIS"
                className={`${styles.logoGlow} ${styles.fadeIn} ${styles.delay1}`}
              />
              <h1 className={`${styles.fadeIn} ${styles.delay2}`}>PEMILIHAN KETUA OSIS</h1>
              <h2 className={`${styles.fadeIn} ${styles.delay3}`}>SMK NEGERI 2 KOLAKA</h2>
            </div>
          )}
        </div>

        {!showGolput && (
          <form onSubmit={handleLogin} className={`${styles.loginForm} ${styles.fadeIn} ${styles.delay4}`}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Masukkan 10 Digit NISN"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                maxLength={10}
                required
              />
            </div>
            <button type="submit" disabled={loading} className={styles.btnSubmit}>
              {loading ? <span className={styles.loader}></span> : "MASUK"}
            </button>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </form>
        )}
      </div>
      
      {!showGolput && (
        <footer className={`${styles.footer} ${styles.fadeIn} ${styles.delay5}`}>
          © 2026 SMK NEGERI 2 KOLAKA
        </footer>
      )}
    </div>
  );
}
