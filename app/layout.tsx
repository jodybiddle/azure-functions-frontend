"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient =  new QueryClient();
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} mx-auto max-w-4xl`}
      >
        <QueryClientProvider client={queryClient}>
          <header className="flex justify-between gap-6 items-center bg-neutral-900 border-b border-neutral-800 py-4 px-8 shadow-md mb-6">
            <div className="flex items-center gap-2">
              <div className="size-10">
                <Image src="/icon.png" alt="logo" width={100} height={100} />
              </div>
              <h1 className="text-white font-semibold text-2xl">Project Management App</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white font-semibold hover:text-blue-400 transition-colors">Projects</Link>
              <Link href="/employees" className="text-white font-semibold hover:text-blue-400 transition-colors">Employees</Link>
            </div>
          </header>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}
