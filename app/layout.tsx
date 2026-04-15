import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import EcosystemNav from "@/components/EcosystemNav";
import { CommandPalette } from "@/components/CommandPalette";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SnowOverlay } from "@/components/SnowOverlay";
import { ActionDock } from "@/components/ActionDock";
import { CompanionProvider } from "@/components/companion/CompanionContext";
import { CompanionShell } from "@/components/companion/CompanionShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HASSAAN AI ARCHITECT — Digital FTE",
  description:
    "Autonomous CRM and Course Companion engine for the Panaversity Ecosystem.",
  icons: {
    icon: "https://emojicdn.elk.sh/✨",
  },
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
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} selection:bg-accent/20 selection:text-accent`}
    >
      <body className="font-sans bg-background text-foreground min-h-screen antialiased overflow-x-hidden">
        <LanguageProvider>
          {/*
           * CompanionProvider must wrap ActionDock AND CompanionShell so
           * Framer Motion's layoutId FLIP can observe both ends of the morph
           * in the same React tree.
           */}
          <CompanionProvider>
            {/* Subtle background texture */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-texture opacity-50" />

            {/* Atmospheric overlay */}
            <SnowOverlay />

            {/* Floating action dock — chat button carries layoutId="companion-orb" */}
            <ActionDock />

            {/* Main content */}
            <div className="relative z-0">{children}</div>

            {/*
             * CompanionShell — renders the morphing companion window via
             * createPortal. Replaces <AiraAssistant> entirely.
             * The layoutId="companion-orb" FLIP connects the ActionDock chat
             * button to this window seamlessly.
             */}
            <CompanionShell
              platform="H4"
              context="Digital FTE is monitoring the Kafka 'struggle.alerts' topic. CRM Tickets are synchronized. All autonomous agents are active."
            />

            {/* Command-K palette */}
            <CommandPalette />

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background:   "var(--bg-surface)",
                  color:        "var(--text-primary)",
                  border:       "0.8px solid var(--border-fine)",
                  fontSize:     "14px",
                  fontWeight:   500,
                  borderRadius: "16px",
                  padding:      "16px",
                  boxShadow:    "0 10px 40px -4px rgba(0, 0, 0, 0.08)",
                },
              }}
            />

            <EcosystemNav />
          </CompanionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
