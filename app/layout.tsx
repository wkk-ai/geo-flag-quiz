import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRegistration } from "@/components/PwaRegistration";
import { withBase } from "@/lib/paths";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geo Quiz — Flags & Maps",
  description: "Name flags and countries. 3 lives, streaks, and a best score to beat. Works offline on your phone.",
  applicationName: "Geo Quiz",
  appleWebApp: {
    capable: true,
    title: "Geo Quiz",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: withBase("/icon.svg"), type: "image/svg+xml" },
      { url: withBase("/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: withBase("/apple-icon.png"), sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PwaRegistration />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Skip to game
        </a>
        {children}
      </body>
    </html>
  );
}
