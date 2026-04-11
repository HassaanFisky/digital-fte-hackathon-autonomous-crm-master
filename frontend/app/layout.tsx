import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import EcosystemNav from "@/components/EcosystemNav";
import { AiraAssistant } from "@/components/AiraAssistant";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SnowOverlay } from "@/components/SnowOverlay";
import { ActionDock } from "@/components/ActionDock";
import { Notebook } from "@/components/Notebook";
import { ThemeProvider } from "next-themes";

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
  title: "HASSAAN AI ARCHITECT — Digital FTE",
  description: "Autonomous CRM and Course Companion engine for the Panaversity Ecosystem.",
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
    <LanguageProvider>
      <html lang="en" className={`${inter.variable} ${lora.variable} selection:bg-[#D97757]/20 selection:text-[#D97757]`}>
        <body className="font-sans bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            {/* Subtle Background Detail */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-texture opacity-50" />
            
            {/* Interactivity Layers */}
            <SnowOverlay />
            <Notebook />
            <ActionDock />

            {/* Main Content */}
            <div className="relative z-0">
              {children}
            </div>

            {/* Assistant Node */}
            <AiraAssistant 
              platform="H4" 
              context="Digital FTE is monitoring the Kafka 'struggle.alerts' topic. CRM Tickets are synchronized. All autonomous agents are active." 
            />

            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: "var(--bg-elevated)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-fine)",
                  fontSize: "14px",
                  fontWeight: 500,
                  borderRadius: "16px",
                  padding: "16px",
                  boxShadow: "var(--shadow-float)",
                },
              }} 
            />
            <EcosystemNav />
          </ThemeProvider>
        </body>
      </html>
    </LanguageProvider>
  );
}
