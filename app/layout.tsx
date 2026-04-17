import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RootLayoutClient } from "@/components/root-layout-client";

const inter = Inter({ subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Luminary — Become the Light",
  description: "Illuminate your learning journey. Master any skill with Luminary's intelligent scheduling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} ${spaceGrotesk.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="Luminary" enableSystem={false}>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </ThemeProvider>
      </body>
    </html>
  );
}
