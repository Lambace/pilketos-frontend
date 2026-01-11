"use client";
import { useEffect, useState } from "react";
import { getStudents, getCandidates, getSettings } from "../../../lib/api";
import styles from "./print.module.css";

// Definisikan API URL Backend Anda
const API_URL = "https://voting-backend-m3x97t3q3-lambaces-projects-0016ee68.vercel.app";

export default function PrintBeritaAcara() {
    const [data, setData] = useState<any>(null);
    const [params, setParams] = useState({ size: 'A4', fs: '11', mt: '10' });

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        setParams({
            size: searchParams.get('size') || 'A4',
            fs: searchParams.get('fs') || '11',
            mt: searchParams.get('mt') || '10'
        });

        const fetchData = async () => {
            try {
                const [students, candidates, settings] = await Promise.all([
                    getStudents(),
                    getCandidates(),
                    getSettings()
                ]);

                setData({
                    students: students || [],
                    candidates: (candidates || []).map((c: any) => ({
                        ...c,
                        suara_fix: Number(c.votes_count || c.suara || 0)
                    })).sort((a: any, b: any) => a.nomor_urut - b.nomor_urut),
                    settings: Array.isArray(settings) ? settings[0] : settings
                });
            } catch (err) {
                console.error("Gagal memuat data cetak", err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data) {
            const timer = setTimeout(() => {
                window.print();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [data]);

    if (!data) return <div style={{ padding: '20px' }}>Memuat Dokumen Berita Acara...</div>;

    const { settings, candidates, students } = data;
    const totalSuara = candidates.reduce((acc: number, curr: any) => acc + curr.suara_fix, 0);
    const pemenang = [...candidates].sort((a, b) => b.suara_fix - a.suara_fix)[0];

    const isF4 = params.size === 'F4';
    const paperSize = isF4 ? '215mm 330mm' : 'A4';

    let calculatedFontSize = parseInt(params.fs);
    let spacing = "20px";

    if (candidates.length > 4 && candidates.length <= 6) {
        calculatedFontSize = calculatedFontSize - 1;
        spacing = "10px";
    } else if (candidates.length > 6) {
        calculatedFontSize = calculatedFontSize - 2;
        spacing = "5px";
    }

    return (
        <div
            className={styles.container}
            style={{
                width: isF4 ? '215mm' : '210mm',
                fontSize: `${calculatedFontSize}pt`,
                paddingTop: `${params.mt}mm`,
                lineHeight: '1.4',
                margin: '0 auto',
                backgroundColor: 'white'
            }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { 
                    size: ${paperSize}; 
                    margin: 0; 
                }
                @media print {
                    body { background: white !important; }
                    .narrative { margin-bottom: ${spacing}; }
                }
            `}} />

            {/* HANYA MENAMPILKAN GAMBAR KOP FULL */}
            <div className={styles.kopFullWrapper} style={{ width: '100%', marginBottom: '20px' }}>
                {settings.kop_full && (
                    <img
                        src={`${API_URL}${settings.kop_full}`}
                        className={styles.imgKopFull}
                        alt="Kop Surat"
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                )}
            </div>

            <div className={styles.baBody}>
                <h2 className={styles.baTitle} style={{ textAlign: 'center', textDecoration: 'underline', marginBottom: '2px', fontWeight: 'bold' }}>BERITA ACARA PEMILIHAN KETUA OSIS</h2>
                <p className={styles.baSubTitle} style={{ textAlign: 'center', marginTop: 0, marginBottom: '25px' }}>Periode {settings.tahun_pelajaran}</p>

                <p className={styles.narrative}>
                    Pada hari ini <strong>{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</strong>,
                    Tanggal <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>,
                    telah dilaksanakan Pemilihan Ketua OSIS {settings.nama_sekolah} dengan ketentuan sebagai berikut:
                </p>

                <table className={styles.infoTable} style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr><td width="200" style={{ padding: '4px 0' }}>1. Tempat Pelaksanaan</td><td>: {settings.tempat_pelaksanaan}</td></tr>
                        <tr><td style={{ padding: '4px 0' }}>2. Peserta Pemilih (DPT)</td><td>: {students.length} Siswa</td></tr>
                        <tr><td style={{ padding: '4px 0' }}>3. Jumlah Suara Sah</td><td>: {totalSuara} Suara</td></tr>
                        <tr>
                            <td valign="top" style={{ padding: '4px 0' }}>4. Hasil Perolehan Suara</td>
                            <td>:
                                <ul className={styles.listKandidat} style={{ listStyle: 'none', paddingLeft: '15px', margin: '5px 0' }}>
                                    {candidates.map((c: any, i: number) => (
                                        <li key={i} style={{ marginBottom: '2px' }}>
                                            No. Urut {c.nomor_urut}: {c.name} — <strong>{c.suara_fix} Suara</strong>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p className={styles.narrative} style={{ marginTop: '25px' }}>
                    Berdasarkan hasil Penghitungan Suara tersebut di atas, maka yang ditetapkan sebagai Ketua OSIS terpilih {settings.nama_sekolah}
                    periode {settings.tahun_pelajaran} adalah <strong>{pemenang?.name}</strong>.
                </p>
            </div>

            {/* TANDA TANGAN */}
            <div className={styles.signatureSection} style={{ marginTop: '50px' }}>
                <div className={styles.dateInfo} style={{ textAlign: 'right', marginBottom: '10px' }}>
                    <p>
                        {settings.lokasi_tanda_tangan || settings.tempat_pelaksanaan}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <p style={{ textAlign: 'center', marginBottom: '30px', width: '100%' }}>Mengetahui,</p>

                <div className={styles.sigRow} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className={styles.sigBox} style={{ textAlign: 'center', width: '45%' }}>
                        <p>Ketua Panitia,</p>
                        <div style={{ height: '90px' }}></div>
                        <p><strong><u>{settings.ketua_nama || "...................."}</u></strong></p>
                        <p>NIP. {settings.ketua_nip || "-"}</p>
                    </div>
                    <div className={styles.sigBox} style={{ textAlign: 'center', width: '45%' }}>
                        <p>Kepala Sekolah,</p>
                        <div style={{ height: '90px' }}></div>
                        <p><strong><u>{settings.kepsek_nama || "...................."}</u></strong></p>
                        <p>NIP. {settings.kepsek_nip || "-"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}