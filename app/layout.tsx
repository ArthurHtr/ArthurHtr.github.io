import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inside the Future of Malting | Malt / Futures",
  description: "Explore a conceptual malting facility in interactive 3D, from grain intake to connected, AI-enabled production. Inspired by Soufflet & Malt.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
