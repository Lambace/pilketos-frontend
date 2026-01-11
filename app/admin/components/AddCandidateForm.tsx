"use client";
import { useState } from "react";

const API_URL = "https://voting-backend-m3x97t3q3-lambaces-projects-0016ee68.vercel.app"; // ganti sesuai domain Vercel kamu

interface Candidate {
    id: number;
    name: string;
    vision: string;
    mission: string;
    nomor_urut: number;
    photo?: string;
}

export default function EditCandidateForm({
    candidate,
    onCancel,
    onSuccess,
}: {
    candidate: Candidate;
    onCancel: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState<Candidate>(candidate);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("vision", formData.vision);
        data.append("mission", formData.mission);
        data.append("nomor_urut", formData.nomor_urut.toString());
        if (file) data.append("photo", file);

        try {
            const res = await fetch(`${API_URL}/candidates/${formData.id}`, {
                method: "PUT",
                body: data,
            });

            if (!res.ok) throw new Error("Gagal update kandidat");
            alert("✅ Kandidat berhasil diperbarui!");
            onSuccess();
        } catch (err: any) {
            alert("❌ Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded bg-gray-50">
            <h3 className="text-lg font-semibold">Edit Kandidat</h3>
            <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            <textarea
                name="vision"
                value={formData.vision}
                onChange={handleChange}
                required
            />
            <textarea
                name="mission"
                value={formData.mission}
                onChange={handleChange}
                required
            />
            <input
                type="number"
                name="nomor_urut"
                value={formData.nomor_urut}
                onChange={handleChange}
                required
            />
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />

            <div className="space-x-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    {loading ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
