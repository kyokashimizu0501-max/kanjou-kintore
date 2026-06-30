import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "感情筋トレ",
  description: "感情に左右されない自分をつくるアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={geist.variable}>
      <body>
        <div id="app-shell">
          <div className="flex-1 overflow-y-auto pb-20">{children}</div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
