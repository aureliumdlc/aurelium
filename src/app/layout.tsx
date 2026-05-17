import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Background } from "@/components/Background";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/components/AuthProvider";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin", "cyrillic"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "AureliumDLC — Minecraft Client",
  description: "Premium Minecraft client subscription",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`dark ${geist.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <Providers>
          <AuthProvider>
            <Background />
            <Navbar />
            <main className="relative flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
