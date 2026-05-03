import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import "./globals.css";

import { getSiteUrl, tryGetMetadataBase } from "@/lib/site-url";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: tryGetMetadataBase(),
  title: {
    default: "DormMate — Shared household finance",
    template: "%s · DormMate",
  },
  description:
    "Receipts, splits, and dorm clarity — AI-ready, mobile-first.",
  openGraph: {
    url: process.env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : undefined,
    title: "DormMate",
    description: "Clean-tech shared housing pulse — receipts to settle-up.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-dm-bg font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
