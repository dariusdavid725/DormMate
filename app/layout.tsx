import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import { getSiteUrl, tryGetMetadataBase } from "@/lib/site-url";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: tryGetMetadataBase(),
  title: {
    default: "DormMate — Less awkward shared living",
    template: "%s · DormMate",
  },
  description:
    "Fair splits, shared staples, and receipt scans — built for roommates & student flats who’d rather live together than negotiate in spreadsheets.",
  openGraph: {
    url: process.env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : undefined,
    title: "DormMate",
    description:
      "Shared housing tools that feel human — money, groceries, chores.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-50">
        {children}
      </body>
    </html>
  );
}
