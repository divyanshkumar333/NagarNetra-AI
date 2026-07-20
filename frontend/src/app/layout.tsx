import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "NagarNetra AI",
  description: "The Intelligent Eye of the City - AI Smart City Operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans dark antialiased", geist.variable)}>
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
