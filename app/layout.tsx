import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, Nunito_Sans } from "next/font/google";

import "./globals.css";

import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { getSiteUrl, tryGetMetadataBase } from "@/lib/site-url";

const nunito = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-cozy-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#5a7a5f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: tryGetMetadataBase(),
  applicationName: "DormMate",
  title: {
    default: "DormMate — Shared homes, fair splits",
    template: "%s · DormMate",
  },
  description:
    "Chores with tiny rewards, receipts, and groceries — built for dorms and flats.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.png", type: "image/png" }],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "DormMate",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    url: process.env.NEXT_PUBLIC_SITE_URL ? getSiteUrl() : undefined,
    title: "DormMate",
    description:
      "Chores with tiny rewards, receipts, and groceries — built for dorms and flats.",
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
      className={`h-full ${nunito.variable} ${caveat.variable} ${plexMono.variable}`}
    >
      <body className="dm-app-body flex min-h-full flex-col bg-dm-bg font-sans antialiased">
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
