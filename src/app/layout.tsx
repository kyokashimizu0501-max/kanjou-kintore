import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "600", "700"],
});

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
    <html
      lang="ja"
      className={notoSansJP.variable}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans antialiased">
        <div id="app-shell">
          <main className="flex-1 overflow-y-auto pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
