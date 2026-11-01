import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Instrument_Sans } from "next/font/google";
import { site } from "@/content";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--f-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body", display: "swap" });
const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-mono", display: "swap" });

const description =
  "18K Intelligence: creative tech entrepreneur and filmmaker. Free Starter Kit, courses on filming and building with AI, and 1:1 strategy calls.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "18K Intelligence · Build, film, teach", template: "%s · 18K Intelligence" },
  description,
  openGraph: { title: "18K Intelligence · I build businesses, apps and films", description, siteName: "18K Intelligence", type: "website" },
  twitter: { card: "summary_large_image", title: "18K Intelligence · I build businesses, apps and films", description },
};

export const viewport: Viewport = { themeColor: "#0E0D0F", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
