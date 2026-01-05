import type { Metadata } from "next";
import { ChecklistProvider } from "@/context/ChecklistContext";
import "./globals.css";

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
        <html lang="en">
            <body>
                <ChecklistProvider>
                    {children}
                </ChecklistProvider>
            </body>
        </html>
    );
}
