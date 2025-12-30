import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PILKETOS SMKN 2 KOLAKA",
  description: "Aplikasi voting berbasis Next.js + Express",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
