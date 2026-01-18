import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChecklistProvider } from "@/context/ChecklistContext";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Task Checker - Productivity App",
    description: "A clean checklist and schedule tracker for your daily routine",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable}>
            <body className={inter.className}>
                <ChecklistProvider>
                    {children}
                </ChecklistProvider>
            </body>
        </html>
    );
}
