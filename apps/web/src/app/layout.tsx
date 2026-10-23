import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { en } from "shared";
import { designTokenStyle } from "@/lib/design-tokens";
import "./globals.css";

// The same friendly font as the mobile app.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: en.appName,
  description: en.dashboard.title,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`} style={designTokenStyle()}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
