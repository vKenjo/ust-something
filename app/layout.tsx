import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

// Inter as fallback for Roobert PRO (Miro's font)
// Inter has similar geometric proportions and works well with negative letter-spacing
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "uste — Your Academic Companion",
  description: "Calculate your GWA and sync your schedule to Google Calendar. Built for University of Santo Tomas students.",
  keywords: ["UST", "GWA calculator", "schedule", "University of Santo Tomas", "Thomasian"],
  authors: [{ name: "Kenjo" }],
  openGraph: {
    title: "uste — Your Academic Companion",
    description: "Calculate your GWA and sync your schedule to Google Calendar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
