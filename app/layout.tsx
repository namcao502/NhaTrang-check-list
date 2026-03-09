import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0077b6",
};

export const metadata: Metadata = {
  title: "Nha Trang Packing List \u{1F30A}",
  description: "Danh s\u00E1ch chu\u1EA9n b\u1ECB \u0111\u1ED3 \u0111i bi\u1EC3n Nha Trang",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Packing List",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <Script src="/dark-mode.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
