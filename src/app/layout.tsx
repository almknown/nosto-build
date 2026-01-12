import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  title: "NosBot | AI-Powered YouTube History Curator",
  description: "NosBot uses advanced AI to curate playlists from any YouTube channel's history. Precise filtering, deep search, and intelligent context understanding.",
  keywords: ["youtube", "playlist", "ai", "curator", "nosbot", "history", "video search"],
  openGraph: {
    title: "NosBot | Intelligent Video Curation",
    description: "Your AI Curator for YouTube History",
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
        <SpeedInsights />
      </body>
    </html>
  );
}
