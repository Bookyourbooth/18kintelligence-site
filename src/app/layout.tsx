import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { CookieConsent } from "@/components/cookie-consent";
import { site } from "@/content";
import "./globals.css";

const sans = Geist({ subsets: ["latin"], variable: "--f-sans", display: "swap" });

const description =
  "Learn to build websites and apps, make films and market your own business with Kwame, a creative tech entrepreneur and founder. Free Starter Kit, a weekly email and 1:1 strategy calls.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "18K Intelligence · Build, film, teach", template: "%s · 18K Intelligence" },
  description,
  openGraph: { title: "18K Intelligence · Build it with AI and take it to market", description, siteName: "18K Intelligence", type: "website" },
  twitter: { card: "summary_large_image", title: "18K Intelligence · Build it with AI and take it to market", description },
};

export const viewport: Viewport = { themeColor: "#0E0D0F", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
