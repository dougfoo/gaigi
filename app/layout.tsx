import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaigi - Report Suspicious Things",
  description: "Anonymous reporting and mapping of suspicious sightings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
