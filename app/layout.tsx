import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "APJ Battle Map",
  description:
    "Territory intelligence for Anthropic APJ revenue leadership. Lighthouse capture rate, relationship graph, and full-court press playbook.",
  openGraph: {
    title: "APJ Battle Map",
    description: "Territory intelligence for Anthropic APJ revenue leadership.",
    siteName: "APJ Battle Map",
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
      /* dark class is permanent — this is a dark-only operator tool */
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-[#09090B] text-zinc-50 font-sans">
        {children}
      </body>
    </html>
  );
}
