"use client";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import StudentsTable from "./components/StudentsTable";
import CandidatesTable from "./components/CandidatesTable";
import SettingsForm from "./components/SettingsForm";
import VotingToggle from "./components/VotingToggle";
import ImportStudents from "./components/ImportStudents";
import DownloadStudentFormat from "./components/DownloadStudentFormat";

const AdminPage = () => {
  const [view, setView] = useState("dashboard");

  return (
    <div>
      {/* tombol import & download */}
      <div className="flex gap-4 my-4">
        <ImportStudents />
        <DownloadStudentFormat />
      </div>

      <nav className="flex gap-4 p-4 bg-gray-200">
        <button onClick={() => setView("dashboard")}>Dashboard</button>
        <button onClick={() => setView("students")}>Siswa</button>
        <button onClick={() => setView("candidates")}>Kandidat</button>
        <button onClick={() => setView("settings")}>Pengaturan</button>
      </nav>

      <main className="p-6">
        {view === "dashboard" && <Dashboard />}
        {view === "students" && <StudentsTable />}
        {view === "candidates" && <CandidatesTable />}
        {view === "settings" && (
          <>
            <VotingToggle />
            <SettingsForm />
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
