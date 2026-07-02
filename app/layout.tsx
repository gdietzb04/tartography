import type { Metadata } from "next";
import { Bricolage_Grotesque, Bitter, Schibsted_Grotesk } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

// Display + wordmark + editorial headings.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["500", "600", "700", "800"],
});

// Shop names — sturdy slab serif, legible in dense lists.
const bitter = Bitter({
  subsets: ["latin"],
  variable: "--font-bitter",
  weight: ["500", "600", "700"],
});

// Body + UI.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  weight: ["400", "500", "600", "700"],
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
      <body
        className={`${bricolage.variable} ${bitter.variable} ${schibsted.variable} font-body antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
