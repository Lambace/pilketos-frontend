"use client";
import { useEffect, useState } from "react";
import { getStudents, deleteStudent } from "../../../lib/api";

export default function StudentsTable() {
    const [students, setStudents] = useState<any[]>([]);

    const loadStudents = async () => {
        const data = await getStudents();
        setStudents(Array.isArray(data) ? data : []);
    };

    useEffect(() => {
        loadStudents();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Daftar Siswa</h2>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th>NISN</th><th>Nama</th><th>Tingkat</th><th>Kelas</th><th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.id}>
                            <td>{s.nisn}</td>
                            <td>{s.name}</td>
                            <td>{s.tingkat}</td>
                            <td>{s.kelas}</td>
                            <td>
                                <button
                                    onClick={async () => { await deleteStudent(s.id); loadStudents(); }}
                                    className="bg-red-500 text-white px-2 py-1 rounded"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
