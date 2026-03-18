import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeatLab — AI Music Creation Platform",
  description: "Pro-grade AI-powered multi-track music creation DAW",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
