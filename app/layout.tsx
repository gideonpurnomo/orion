import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Orion - Learning Schedule Orchestrator",
  description: "Orchestrate your learning journey. Master any skill with Orion's intelligent scheduling system.",
};

'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme, systemTheme } = useTheme()

  // Apply theme class to body when theme changes
  useEffect(() => {
    const body = document.body
    if (body) {
      const themeClass = `theme-${theme}`
      if (theme === 'Sunrise' || theme === 'Forest' || theme === 'Nebula' || theme === 'Aurora') {
        body.classList.add(themeClass)
      } else {
        // Remove custom theme classes if using light/dark
        body.classList.remove('theme-sunrise', 'theme-forest', 'theme-nebula', 'theme-aurora')
      }
    }
  }, [theme])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme={systemTheme} enableSystem>
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
