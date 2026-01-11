"use client";

const API_URL = "https://voting-backend-m3x97t3q3-lambaces-projects-0016ee68.vercel.app";

export default function DownloadStudentFormat() {
    const handleDownload = async () => {
        try {
            const res = await fetch(`${API_URL}/students/download`);
            if (!res.ok) throw new Error("Gagal download format");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "template.xlsx";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("❌ Gagal download format siswa");
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-green-500 text-white px-4 py-2 rounded"
        >
            ⬇ Download Format Excel
        </button>
    );
}
