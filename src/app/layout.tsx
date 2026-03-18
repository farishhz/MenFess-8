import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { BanCheckProvider } from "@/components/ban-check-provider";

export const metadata: Metadata = {
  title: "MenFess 8 - Anonymous Confession Platform",
  description: "Share your thoughts anonymously with MenFess 8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <BanCheckProvider />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}