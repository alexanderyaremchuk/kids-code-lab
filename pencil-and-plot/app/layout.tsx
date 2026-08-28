import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Pencil & Plot — Eleven Clever Tabletop Games",
  description: "Play eleven quick number, line, shape, and territory games in a bright digital pencil-game arcade.",
  openGraph: {
    title: "Pencil & Plot",
    description: "Eleven tiny games. Endless clever moves.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Pencil & Plot — eleven tiny games with numbers, grids, matchsticks, dominoes, paper cuts, and star sums" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pencil & Plot",
    description: "Eleven tiny games. Endless clever moves.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
