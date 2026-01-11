"use client";
import { useState, useEffect } from "react";

const API_URL = "https://voting-backend-production-ea29.up.railway.app";

export default function SettingsForm() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/settings`)
            .then(res => res.json())
            .then(data => setSettings(Array.isArray(data) ? data[0] : data));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData();
        Object.entries(settings).forEach(([key, value]) => {
            formData.append(key, String(value ?? ""));
        });

        const res = await fetch(`${API_URL}/settings/update`, {
            method: "POST",
            body: formData
        });

        if (res.ok) alert("✅ Pengaturan disimpan!");
        else alert("❌ Gagal menyimpan");

        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label>Nama Sekolah</label>
                <input
                    type="text"
                    value={settings.nama_sekolah || ""}
                    onChange={e => setSettings({ ...settings, nama_sekolah: e.target.value })}
                />
            </div>
            <button type="submit" disabled={isSaving} className="bg-blue-500 text-white px-4 py-2 rounded">
                {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
        </form>
    );
}
