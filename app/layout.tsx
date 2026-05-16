import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Recommendation",
  description: "Portfolio recommendation application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com" />
        <link rel="dns-prefetch" href="https://antarctica-hiring-data.s3.eu-west-1.amazonaws.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}