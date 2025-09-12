import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "mmovies",
  description: "Swipe to discover movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <header className="sticky top-0 z-50 bg-background/70 backdrop-blur border-b border-foreground/10">
          <div className="mx-auto max-w-3xl h-14 px-4 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">mmovies</Link>
            <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">Home</Link>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
