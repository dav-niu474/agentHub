import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgentHub - AI Multi-Agent Platform",
  description: "Unlock your AI Agent Team. AgentHub is a multi-agent platform boosting productivity for knowledge workers in complex business scenarios like marketing, strategy and all kinds of research.",
  keywords: ["AgentHub", "AI", "Multi-Agent", "AI Platform", "Knowledge Workers", "Marketing", "Research", "Strategy"],
  authors: [{ name: "AgentHub Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AgentHub - AI Multi-Agent Platform",
    description: "Unlock your AI Agent Team with specialized AI agents for marketing, research, strategy, and more.",
    siteName: "AgentHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentHub - AI Multi-Agent Platform",
    description: "Unlock your AI Agent Team with specialized AI agents for marketing, research, strategy, and more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
