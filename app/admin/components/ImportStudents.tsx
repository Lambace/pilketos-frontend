"use client";
import { useState } from "react";

const API_URL = "https://voting-backend-m3x97t3q3-lambaces-projects-0016ee68.vercel.app";

export default function ImportStudents() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleImport = async () => {
        if (!file) {
            alert("❌ Pilih file Excel terlebih dahulu!");
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/students/import`, {
                method: "POST",
                body: formData
            });
            if (res.ok) {
                alert("✅ Data siswa berhasil diimport!");
            } else {
                alert("❌ Gagal import siswa");
            }
        } catch (err) {
            alert("❌ Terjadi kesalahan koneksi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button
                onClick={handleImport}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                {loading ? "Mengimport..." : "Import Siswa dari Excel"}
            </button>
        </div>
    );
}
