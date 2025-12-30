"use client";
import { useEffect, useState } from "react";
import {  redirect, useRouter} from "next/navigation";
import { apiFetch } from "../lib/api";
export default function Home() {
  const [status, setStatus] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/login")
      .then(res => res.json())
      .then(data => {
        setStatus(Boolean(data.voting_open));
      });
  }, []);

}