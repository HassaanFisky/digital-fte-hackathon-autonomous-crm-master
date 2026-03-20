import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const syne = Syne({ 
  subsets: ["latin"],
  weight: ['400', '600', '700', '800'],
  variable: '--font-head',
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: "ARIA — Digital FTE | My AI Success Employee",
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
    <html lang="en" className={`dark scroll-smooth ${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-text font-body antialiased selection:bg-em/30 selection:text-em font-normal">
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#141F33',
              color: '#F0F6FF',
              border: '1px solid #1E3050',
            },
          }}
        />
        {/* Removed max-width from layout to let page.tsx handle centering of content while maintaining full-width backgrounds */}
        {children}
      </body>
    </html>
  );
}
