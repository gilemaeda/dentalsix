import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DentalSix",
  description: "Sistema de gestão para clínicas odontológicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
