"use client";
import { useEffect, useState } from "react";
import {  redirect, useRouter} from "next/navigation";

export default function Home() {
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:5000/settings")
      .then(res => res.json())
      .then(data => {
        setStatus(Boolean(data.voting_open));
      });
  }, []);

  if (status === null) return <p>Loading...</p>;

  if (status === true) {
    redirect("/login");
  }

  if (status === false) {
    return <div>Voting sudah selesai. Silakan lihat hasil.</div>;
  }

  return <p>Menunggu status...</p>;
}
