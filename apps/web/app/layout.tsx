import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenClaw SaaS - Your AI Agent Platform",
  description: "Deploy powerful AI agents in minutes. Choose your skill pack and start automating.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <main className="min-h-screen bg-background antialiased">
          {children}
        </main>
      </body>
    </html>
  );
}
