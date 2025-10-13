import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GaiGi 外疑 - Report Suspicious Things",
  description: "Anonymous reporting and mapping of suspicious sightings",
  icons: {
    icon: '/favicon.svg',
  },
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
