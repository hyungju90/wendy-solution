import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "웬디 솔루션",
  description: "Authorized Employees Only",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 🎨 [Typography] 페이퍼로지 감성의 단단한 고가독성 프리텐다드 웹폰트 최신본 로드 파이프라인 */}
        <link 
          rel="stylesheet" 
          as="style" 
          crossOrigin="anonymous" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" 
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}