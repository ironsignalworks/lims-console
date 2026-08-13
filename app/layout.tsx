import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LAB_TITLE_LINE } from "./labIdentity";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "LIMS Console (Demo) · YeastGenomics";
const siteDescription =
  "Interactive LIMS demo for yeast genomics — strain registry, pipeline scenarios, reports, and simulated lab ops.";

function siteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3001";
}

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: siteTitle,
    template: "%s · LIMS Console",
  },
  description: siteDescription,
  applicationName: "LIMS Console",
  authors: [{ name: "Iron Signal Works" }],
  keywords: [
    "LIMS",
    "yeast genomics",
    "bioinformatics",
    "pipeline monitoring",
    "strain registry",
    "NOVA FCT",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "LIMS Console",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  other: {
    "og:brand": LAB_TITLE_LINE,
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
