import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteHeader } from "@/features/header/site-header";
import { CartProvider } from "@/lib/context/CartContext";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lumière Parlour",
    template: "%s · Lumière Parlour",
  },
  description: "Book services and shop retail — parlour MVP (App Router, Server Actions).",
};

function HeaderSkeleton() {
  return (
    <header className="border-b border-[var(--shop-border)] bg-[var(--shop-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6" />
    </header>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col text-[var(--shop-ink)]">
        <ErrorBoundary>
          <CartProvider>
            <Suspense fallback={<HeaderSkeleton />}>
              <SiteHeader />
            </Suspense>
            {children}
          </CartProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
