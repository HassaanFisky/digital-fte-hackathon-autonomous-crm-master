import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARIA — Digital FTE | AI Customer Success Platform",
  description: "24/7 AI-powered customer support autonomously handles tickets across all channels.",
  icons: {
    icon: "https://emojicdn.elk.sh/🤖",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-50 antialiased`}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
