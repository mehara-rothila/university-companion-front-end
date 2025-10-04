// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NotificationToast from "../components/NotificationToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Athena - Smart Campus Companion | AI-Powered University Assistant",
  description: "Transform your university experience with Athena, your intelligent campus companion. Get AI-powered assistance, smart navigation, study spaces, and seamless campus integration designed for academic excellence.",
  keywords: ["campus companion", "university assistant", "AI", "student life", "campus navigation", "study spaces", "lost and found", "academic support"],
  authors: [{ name: "University of Moratuwa L3 Project" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Athena - Smart Campus Companion",
    description: "Your intelligent campus companion for enhanced university life",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athena - Smart Campus Companion",
    description: "Transform your university experience with AI-powered campus assistance",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <NotificationToast />
        </Providers>
      </body>
    </html>
  );
}