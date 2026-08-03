import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityController } from "@/components/accessibility-controller";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NeuroTwin OS — Your Mind. Understood. Never Judged.",
  description:
    "An AI learning companion that adapts to every individual brain. Built for neurodivergent learners — safe, seen, calm, empowered.",
  keywords: [
    "neurodivergent",
    "ADHD",
    "autism",
    "dyslexia",
    "AI learning companion",
    "accessibility",
    "adaptive learning",
  ],
  authors: [{ name: "NeuroTwin OS" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "NeuroTwin OS",
    description: "Your Mind. Understood. Never Judged.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#1a2422" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityController />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
