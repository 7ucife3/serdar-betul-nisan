import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Serdar & Betül | Nişan Fotoğraf Paylaşımı",
  description:
    "Serdar & Betül'ün bu özel gününde çektiğiniz fotoğrafları ve tebrik mesajlarınızı paylaşın.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${serifFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAF7F2] text-[#2D2A26] font-sans selection:bg-[#E8D9C5] selection:text-[#5B4323] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
