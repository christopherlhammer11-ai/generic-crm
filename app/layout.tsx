import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynthPipe — AI-Powered Sales Pipeline",
  description:
    "AI-powered CRM with local-first architecture. Built with Next.js, shadcn/ui, and Ollama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
