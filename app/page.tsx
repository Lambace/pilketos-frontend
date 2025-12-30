"use client";
import { useEffect, useState } from "react";
import {  redirect, useRouter} from "next/navigation";
import { apiFetch } from "../lib/api";
export default function Home() {
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/settings")
      .then(res => res.json())
      .then(data => {
        setStatus(Boolean(data.voting_open));
      });
  }, []);

  if (status === null) return <p>Loading...</p>;

  if (status === true) {
    redirect("https://pilketos-frontend.vercel.app");
  }

  if (status === false) {
    return <div>Voting sudah selesai. Silakan lihat hasil.</div>;
  }

  return <p>Menunggu status...</p>;
}
