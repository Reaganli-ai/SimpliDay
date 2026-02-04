import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LifeTracker - Track Your Wellness Journey",
  description: "Track your fitness, diet, mood, and energy levels with AI-powered insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-zinc-50 dark:bg-zinc-950`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
