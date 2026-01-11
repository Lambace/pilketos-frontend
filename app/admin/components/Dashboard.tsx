"use client";
import { useEffect, useState } from "react";
import { getStudents, getCandidates } from "../../../lib/api";

export default function Dashboard() {
    const [students, setStudents] = useState<any[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const sData = await getStudents();
                const cData = await getCandidates();
                setStudents(Array.isArray(sData) ? sData : []);
                setCandidates(Array.isArray(cData) ? cData : []);
            } catch (err) {
                console.error("Error load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const totalDpt = students.length;
    const totalSuaraMasuk = candidates.reduce((acc, curr) => acc + (curr.suara || 0), 0);
    const partisipasi = totalDpt > 0 ? ((totalSuaraMasuk / totalDpt) * 100).toFixed(1) : "0";

    if (loading) return <p>Memuat data dashboard...</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold">Total DPT</h2>
                <p className="text-3xl font-extrabold">{totalDpt}</p>
            </div>

            <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold">Suara Masuk</h2>
                <p className="text-3xl font-extrabold">{totalSuaraMasuk}</p>
            </div>

            <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold">Partisipasi</h2>
                <p className="text-3xl font-extrabold">{partisipasi}%</p>
            </div>
        </div>
    );
}
