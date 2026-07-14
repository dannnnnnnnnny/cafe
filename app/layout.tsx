import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { CartBar } from "@/components/CartBar";
import { CartProvider } from "@/lib/cart";
import "./globals.css";

const noto = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "카페 메뉴 · 주문 예약",
  description: "메뉴를 보고 방문·배달 주문을 신청하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${noto.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-ink">
        <CartProvider>
          {children}
          <CartBar />
        </CartProvider>
      </body>
    </html>
  );
}
