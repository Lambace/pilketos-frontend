"use client";
import { useEffect, useState } from "react";
import {
    getCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
} from "../../../lib/api";
import AddCandidateForm from "./AddCandidateForm";

interface Candidate {
    id: number;
    name: string;
    vision: string;
    mission: string;
    nomor_urut: number;
    photo?: string;
}

export default function CandidatesTable() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const loadCandidates = async () => {
        try {
            const data = await getCandidates();
            setCandidates(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Error load candidates:", err.message);
        }
    };

    useEffect(() => {
        loadCandidates();
    }, []);

    const handleDelete = async (id: number) => {
        await deleteCandidate(id);
        loadCandidates();
    };

    const handleUpdate = async () => {
        if (!editingCandidate) return;

        const data = new FormData();
        data.append("name", editingCandidate.name);
        data.append("vision", editingCandidate.vision);
        data.append("mission", editingCandidate.mission);
        data.append("nomor_urut", editingCandidate.nomor_urut.toString());
        if (file) data.append("photo", file);

        await updateCandidate(editingCandidate.id, data);
        setEditingCandidate(null);
        setFile(null);
        loadCandidates();
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Daftar Kandidat</h2>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th>Nomor Urut</th>
                        <th>Foto</th>
                        <th>Nama</th>
                        <th>Visi</th>
                        <th>Misi</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map((c) => (
                        <tr key={c.id}>
                            <td>{c.nomor_urut}</td>
                            <td>
                                {c.photo ? (
                                    <img
                                        src={c.photo}
                                        alt={c.name}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                ) : (
                                    <span>-</span>
                                )}
                            </td>
                            <td>{c.name}</td>
                            <td>{c.vision}</td>
                            <td>{c.mission}</td>
                            <td className="space-x-2">
                                <button
                                    onClick={() => setEditingCandidate(c)}
                                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Form tambah kandidat */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Tambah Kandidat</h3>
                <AddCandidateForm onSuccess={loadCandidates} candidate={undefined} onCancel={function (): void {
                    throw new Error("Function not implemented.");
                } } />
            </div>

            {/* Form edit kandidat */}
            {editingCandidate && (
                <div className="mt-6 space-y-2 border p-4 rounded bg-gray-50">
                    <h3 className="text-lg font-semibold">Edit Kandidat</h3>
                    <input
                        type="text"
                        value={editingCandidate.name}
                        onChange={(e) =>
                            setEditingCandidate({ ...editingCandidate, name: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        value={editingCandidate.vision}
                        onChange={(e) =>
                            setEditingCandidate({ ...editingCandidate, vision: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        value={editingCandidate.mission}
                        onChange={(e) =>
                            setEditingCandidate({ ...editingCandidate, mission: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        value={editingCandidate.nomor_urut}
                        onChange={(e) =>
                            setEditingCandidate({
                                ...editingCandidate,
                                nomor_urut: Number(e.target.value),
                            })
                        }
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <div className="space-x-2">
                        <button
                            onClick={handleUpdate}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Simpan
                        </button>
                        <button
                            onClick={() => {
                                setEditingCandidate(null);
                                setFile(null);
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
