import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Tartography — every egg tart in New York",
  description:
    "A map of every bakery in New York that sells egg tarts, from Hong Kong-style flaky shells in Flushing to shortcrust classics on Mott Street.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${karla.variable} font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
