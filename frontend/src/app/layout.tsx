import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";

import { CommandPalette } from "@/components/ui/CommandPalette";
import { GlobalToaster } from "@/components/ui/GlobalToaster";
import { KeyboardProvider } from "@/components/layout/KeyboardProvider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "NagarNetra AI | Command Center",
  description: "The Intelligent Eye of the City - Enterprise AI Smart City Operations",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans dark antialiased", geist.variable)}>
      <body>
        <KeyboardProvider>
          <AppShell>
            {children}
          </AppShell>
          <CommandPalette />
          <GlobalToaster />
        </KeyboardProvider>
      </body>
    </html>
  );
}
