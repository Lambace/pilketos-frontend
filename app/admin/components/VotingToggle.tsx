"use client";
import { useState } from "react";

const API_URL = "https://voting-backend-m3x97t3q3-lambaces-projects-0016ee68.vercel.app";

export default function VotingToggle() {
    const [votingOpen, setVotingOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const toggleVoting = async (status: boolean) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/settings/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ voting_open: status })
            });
            if (res.ok) {
                setVotingOpen(status);
                alert(`✅ Voting telah ${status ? "DIBUKA" : "DITUTUP"}`);
            } else {
                throw new Error("Gagal update status");
            }
        } catch (err) {
            alert("❌ Gagal memperbarui status voting");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="my-4">
            <button
                onClick={() => toggleVoting(!votingOpen)}
                disabled={loading}
                className={`px-4 py-2 rounded ${votingOpen ? "bg-red-500" : "bg-green-500"} text-white`}
            >
                {votingOpen ? "Tutup Voting" : "Buka Voting"}
            </button>
        </div>
    );
}
