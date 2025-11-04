import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlockSuite Editor",
  description: "Isolated BlockSuite editor",
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
