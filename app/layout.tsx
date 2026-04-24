import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynthPipe — AI-Powered Sales Pipeline",
  description:
    "AI-synthesized sales pipeline with local-first architecture. Intelligent contact management, deal tracking, and pipeline insights powered by Ollama.",
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
