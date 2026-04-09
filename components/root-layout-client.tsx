'use client'

import { useTheme } from "next-themes";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

const THEME_NAMES = ['Luminary', 'Sunrise', 'Forest', 'Nebula', 'Aurora']

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export function RootLayoutClient({ children }: RootLayoutClientProps) {
  const { theme } = useTheme();

  useEffect(() => {
    const allThemeClasses = THEME_NAMES.map(t => `theme-${t.toLowerCase()}`)
    document.body.classList.remove(...allThemeClasses)

    const match = THEME_NAMES.find(t => t === theme)
    if (match) {
      document.body.classList.add(`theme-${match.toLowerCase()}`)
      document.documentElement.classList.add('dark')
    }
  }, [theme]);

  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
