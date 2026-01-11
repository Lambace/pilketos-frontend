"use client";
import { useEffect, useState } from "react";

export default function AdminSettings() {
    // 1. STATE LENGKAP (15 FIELD SESUAI URUTAN DATABASE)
    const [settings, setSettings] = useState<any>({
        voting_open: false,
        nama_sekolah: "",
        tahun_pelajaran: "",
        warna_tema: "#1cb5e0",
        logo_path: "",
        tempat_pelaksanaan: "",
        kepsek_nama: "",
        kepsek_nip: "",
        ketua_nama: "",
        ketua_nip: "",
        logo_url: "",
        lokasi_tanda_tangan: "",
        logo_kop: "",
        kop_full: ""
    });

    const [fileLogoKop, setFileLogoKop] = useState<File | null>(null);
    const [message, setMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const API_URL = "https://voting-backend-m3x97t3q3-lambaces-projects-0016ee68.vercel.app";

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then((res) => res.json())
            .then((data) => {
                // Jika data array (Postgres), ambil index 0
                const finalData = Array.isArray(data) ? data[0] : data;
                if (finalData) setSettings(finalData);
            });
    }, []);

    // 2. FUNGSI SIMPAN (MENGGUNAKAN FORMDATA AGAR TIDAK UNDEFINED)
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage("");

        try {
            const data = new FormData();

            // KIRIM SESUAI URUTAN YANG KAMU MAU (TIDAK BOLEH TERBALIK)
           
            data.append("nama_sekolah", settings.nama_sekolah || "");
            data.append("tahun_pelajaran", settings.tahun_pelajaran || "");
            data.append("warna_tema", settings.warna_tema || "");
            data.append("logo_path", settings.logo_path || "");
            data.append("tempat_pelaksanaan", settings.tempat_pelaksanaan || "");
            data.append("kepsek_nama", settings.kepsek_nama || "");
            data.append("kepsek_nip", settings.kepsek_nip || "");
            data.append("ketua_nama", settings.ketua_nama || "");
            data.append("ketua_nip", settings.ketua_nip || "");
            data.append("logo_url", settings.logo_url || "");
            data.append("lokasi_tanda_tangan", settings.lokasi_tanda_tangan || "");
            data.append("logo_kop", settings.logo_kop || "");

            // Handling File Kop Full
            if (fileLogoKop) {
                data.append("kop_full", fileLogoKop);
            } else {
                data.append("kop_full", settings.kop_full || "");
            }

            const res = await fetch(`${API_URL}/settings/update`, {
                method: "POST",
                body: data, // Pakai FormData, jangan JSON.stringify
            });

            if (res.ok) {
                setMessage("✅ Pengaturan berhasil disimpan!");
                setFileLogoKop(null);
            } else {
                const errDetail = await res.text();
                setMessage(`❌ Gagal: ${errDetail}`);
            }
        } catch (err) {
            setMessage("❌ Terjadi kesalahan koneksi.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) return <p className="p-10 text-center">Memuat data...</p>;

    return (
        <div className="max-w-4xl mx-auto p-8 font-sans">
            <h1 className="text-2xl font-bold mb-6">Pengaturan Identitas Aplikasi</h1>

            {message && (
                <div className={`p-4 mb-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 shadow-md rounded-xl border">

                {/* BAGIAN 1: INFO UMUM */}
                <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">🏫 Info Sekolah</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Sekolah</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={settings.nama_sekolah} onChange={(e) => setSettings({ ...settings, nama_sekolah: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tahun Pelajaran</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={settings.tahun_pelajaran} onChange={(e) => setSettings({ ...settings, tahun_pelajaran: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tempat Pelaksanaan</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={settings.tempat_pelaksanaan} onChange={(e) => setSettings({ ...settings, tempat_pelaksanaan: e.target.value })} />
                    </div>
                </div>

                {/* BAGIAN 2: PENANDATANGAN */}
                <div className="space-y-4">
                    <h3 className="font-bold border-b pb-2">✍️ Penandatangan</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Kepsek</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={settings.kepsek_nama} onChange={(e) => setSettings({ ...settings, kepsek_nama: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Ketua Panitia</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={settings.ketua_nama} onChange={(e) => setSettings({ ...settings, ketua_nama: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Kota (Tanda Tangan)</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={settings.lokasi_tanda_tangan} onChange={(e) => setSettings({ ...settings, lokasi_tanda_tangan: e.target.value })} />
                    </div>
                </div>

                {/* BAGIAN 3: MEDIA & TEMA */}
                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                    <h3 className="font-bold">🖼️ Media & Warna</h3>
                    <div className="flex gap-6 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Warna Tema</label>
                            <input type="color" className="h-10 w-20 cursor-pointer" value={settings.warna_tema} onChange={(e) => setSettings({ ...settings, warna_tema: e.target.value })} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Upload Kop Surat (Full Image)</label>
                            <input type="file" accept="image/*" onChange={(e) => setFileLogoKop(e.target.files?.[0] || null)} className="w-full text-sm" />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    style={{ backgroundColor: settings.warna_tema }}
                    className="md:col-span-2 py-3 text-white font-bold rounded-md hover:opacity-90 disabled:bg-gray-400"
                >
                    {isSaving ? "SEDANG MENYIMPAN..." : "SIMPAN SEMUA PERUBAHAN"}
                </button>
            </form>
        </div>
    );
}