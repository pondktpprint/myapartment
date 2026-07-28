import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./meter.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "บ้านเรา | ระบบจัดการห้องเช่า",
  description: "จัดการค่าเช่า ค่าน้ำ ค่าไฟ บิลและใบเสร็จในที่เดียว",
  openGraph: {
    title: "บ้านเรา | ระบบจัดการห้องเช่า",
    description: "จัดการค่าเช่า ค่าน้ำ ค่าไฟ บิลและใบเสร็จในที่เดียว",
  },
  twitter: {
    card: "summary_large_image",
    title: "บ้านเรา | ระบบจัดการห้องเช่า",
    description: "จัดการค่าเช่า ค่าน้ำ ค่าไฟ บิลและใบเสร็จในที่เดียว",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
