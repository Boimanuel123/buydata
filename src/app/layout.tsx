import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BuyData - Agent Store",
  description: "Data reselling storefront",
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}
