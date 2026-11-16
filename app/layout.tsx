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
  metadataBase: new URL("https://laocon.vercel.app"),
  title: "Laocoön — Bronze and Time",
  description:
    "A cinematic, scroll-driven WebGL experience built around a bronze horse sculpture.",
  openGraph: {
    title: "Laocoön — Bronze and Time",
    description:
      "A cinematic, scroll-driven WebGL experience built around a bronze horse sculpture.",
    url: "/",
    siteName: "Laocoön",
    images: [{ url: "/images/1.png", width: 1200, height: 1200, alt: "Laocoön — Bronze and Time" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laocoön — Bronze and Time",
    description:
      "A cinematic, scroll-driven WebGL experience built around a bronze horse sculpture.",
    images: ["/images/1.png"],
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