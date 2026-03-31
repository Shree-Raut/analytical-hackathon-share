import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Entrata Analytics — Platform Pulse",
  description: "Real-time visualization of the Entrata platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
