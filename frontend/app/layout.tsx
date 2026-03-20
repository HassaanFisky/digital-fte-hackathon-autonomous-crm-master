import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ARIA — Digital FTE | AI Customer Success",
  description: "24/7 autonomous support agent handled via Email, WhatsApp, and Web.",
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://emojicdn.elk.sh/🤖" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-text-primary min-h-screen antialiased selection:bg-emerald-500/30`}>
        {children}
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: "#1E293B",
            color: "#F8FAFC",
            border: "1px solid #334155"
          }
        }} />
      </body>
    </html>
  );
}
