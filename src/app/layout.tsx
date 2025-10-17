// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NotificationToast from "../components/NotificationToast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Athena - Smart University Companion | AI-Powered University Assistant",
  description: "Transform your university experience with Athena, your intelligent university companion. Get AI-powered assistance, smart navigation, study spaces, and seamless university integration designed for academic excellence.",
  keywords: ["university companion", "university assistant", "AI", "student life", "university navigation", "study spaces", "lost and found", "academic support"],
  authors: [{ name: "University of Moratuwa L3 Project" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "Athena - Smart University Companion",
    description: "Your intelligent university companion for enhanced university life",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Athena - Smart University Companion",
    description: "Transform your university experience with AI-powered university assistance",
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