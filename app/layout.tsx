import type { Metadata } from "next";
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
};

import Navbar from "./components/navbar";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";
import AnnouncementBanner from "./components/AnnouncementBanner";

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
        <AnnouncementBanner />
        <Navbar />
        {children}
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
