import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import BootstrapClient from "@/components/BootstrapClient";
import { LiffProvider } from "@/components/providers/LiffProvider";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TSPI Clinic | Clinical Intelligence Platform",
  description: "Next-generation AI engine for patient care and precision medicine",
  icons: {
    icon: "/drp.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={kanit.variable}>
      <body>
        <LiffProvider>
          <BootstrapClient />
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}
