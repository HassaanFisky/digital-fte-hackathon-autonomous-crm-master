import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ["latin"],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aria — Intelligent Customer Infrastructure",
  description: "Human-centered autonomous support platform.",
  icons: {
    icon: "https://emojicdn.elk.sh/✨",
  }
};

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} selection:bg-[#D97757]/20 selection:text-[#D97757]`}>
      <body className="font-sans bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none -z-10 bg-texture opacity-50" />
        
        {children}

        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: "#ffffff",
              color: "#2D2926",
              border: "1px solid #E5E0D8",
              fontSize: "14px",
              fontWeight: 500,
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 10px 40px -4px rgba(0, 0, 0, 0.08)",
            },
          }} 
        />
      </body>
    </html>
  );
}
