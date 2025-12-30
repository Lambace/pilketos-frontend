import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PILKETOS SMKN 2 KOLAKA",
  description: "Aplikasi voting berbasis Next.js + Express",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: "2rem", backgroundColor: "#f5f5f5" }}>
      {children}
    </div>
  );
}
