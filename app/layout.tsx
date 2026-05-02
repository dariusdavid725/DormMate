import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, tryGetMetadataBase } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: tryGetMetadataBase(),
  title: {
    default: "DormMate — Intelligent Co-Living",
    template: "%s · DormMate",
  },
  description:
    "AI-linked tools for fair shared flats: splits, staples, chores, and focus — without roommate drama.",
  openGraph: {
    url: process.env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : undefined,
    title: "DormMate",
    description: "Co-living OS for fair shared flats and dorms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans text-zinc-900 antialiased dark:bg-black dark:text-zinc-50">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
