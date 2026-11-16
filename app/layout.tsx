import type { Metadata, Viewport } from "next";
import { Italiana, Outfit } from "next/font/google";
import "./globals.css";

const italiana = Italiana({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  weight: ["300", "400", "600"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laocoön — Bronze and Time",
  description:
    "A cinematic, scroll-driven WebGL experience built around a bronze horse sculpture.",
  openGraph: {
    title: "Laocoön — Bronze and Time",
    description:
      "A cinematic, scroll-driven WebGL experience built around a bronze horse sculpture.",
    images: ["/images/1.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${italiana.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  );
}