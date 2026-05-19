import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jeeva Mart",
  description: "Shop daily essentials with ease at Jeeva Mart. Your one-stop online store for groceries, household items, and more. Experience convenient shopping and fast delivery right to your doorstep.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Jeeva Mart",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

import Navbar from "./components/navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import AnnouncementBanner from "./components/AnnouncementBanner";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ServiceWorkerRegistrar />
        <AnnouncementBanner />
        <Navbar />
        {children}
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
