import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BUYDATA | Instant data bundles",
  description: "Buy network data bundles quickly and securely with BUYDATA.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="bg-slate-50">
        {children}
      </body>
    </html>
  );
}
