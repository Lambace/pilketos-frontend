"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { login, getSettings } from "../../lib/api";

export default function LoginPage() {
  const [showGolput, setShowGolput] = useState(true);
  const [nisn, setNisn] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [appSettings, setAppSettings] = useState({
    nama_sekolah: "MEMUAT...",
    tahun_pelajaran: "",
    logo_url: "",
    warna_tema: "#007bff"
  });

  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data) {
          const s = Array.isArray(data) ? data[0] : data;
          setAppSettings({
            nama_sekolah: s.nama_sekolah || "SMK NEGERI",
            tahun_pelajaran: s.tahun_pelajaran || "",
            logo_url: s.logo_url ? `https://hfebjulznbhhzwcjdspb.supabase.co${s.logo_url}` : "/logo-putih.png",
            warna_tema: s.warna_tema || "#007bff"
          });
        }
      } catch {
        console.error("Gagal mengambil pengaturan");
      }
    };
    fetchSettings();

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
      } else if (data.alreadyVoted === true) {
        setError("Akses ditolak: Anda sudah melakukan voting!");
      } else {
        localStorage.setItem("nisn", nisn);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/voting");
      }
    } catch {
      setError("⚠️ Tidak bisa menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContent} style={{ '--primary-color': appSettings.warna_tema } as any}>
      <div className={styles.headerContainer}>
        {showGolput ? (
          <img src="/golput.png" alt="Golput" className={`${styles.golput} ${styles.fadeOut}`} />
        ) : (
          <div className={styles.brandContainer}>
            <img
              src={appSettings.logo_url}
              alt="Logo Sekolah"
              className={`${styles.logoGlow} ${styles.fadeIn} ${styles.delay1}`}
              onError={(e) => (e.currentTarget.src = "/logo-putih.png")}
            />
            <h1 className={`${styles.fadeIn} ${styles.delay2}`}>PEMILIHAN KETUA OSIS</h1>
            <h2 className={`${styles.fadeIn} ${styles.delay3}`}>
              {appSettings.nama_sekolah} <br />
              {appSettings.tahun_pelajaran}
            </h2>
          </div>
        )}
      </div>

      {!showGolput && (
        <>
          <form onSubmit={handleLogin} className={`${styles.loginForm} ${styles.fadeIn} ${styles.delay4}`}>
            <input
              type="text"
              placeholder="Masukkan NISN"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              maxLength={20}
              required
            />
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: appSettings.warna_tema }}
            >
              {loading ? "MENGECEK..." : "LOGIN"}
            </button>
            {error && <p className={styles.errorText}>{error}</p>}
          </form>

          <footer className={`${styles.footer} ${styles.fadeIn} ${styles.delay5}`}>
            E-VOTING {appSettings.nama_sekolah} &copy; {new Date().getFullYear()}
          </footer>
        </>
      )}
    </div>
  );
}
