import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nostalgia Playlist Generator | Rediscover YouTube Classics",
  description: "Generate nostalgic playlists from any YouTube channel. Filter by year, find hidden gems, and relive the golden era of your favorite creators.",
  keywords: ["youtube", "playlist", "nostalgia", "generator", "retro", "classic videos"],
  openGraph: {
    title: "Nostalgia Playlist Generator",
    description: "Rediscover the golden era of YouTube",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
