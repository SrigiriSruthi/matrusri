import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Matrusri Hostel",
  description: "Hostel management — daily operations made simple",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-100 text-slate-900 font-sans antialiased">
        <div className="mx-auto max-w-[480px] min-h-screen bg-white shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
