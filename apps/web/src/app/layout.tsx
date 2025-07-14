import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomApolloProvider from './ApolloProvider';
import { AuthProvider } from '@/contexts/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Walmart AI Shopping Assistant",
  description: "Your intelligent multi-modal shopping companion powered by AI",
  keywords: ["shopping", "AI", "assistant", "Walmart", "multi-modal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/spark-icon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
      >
        <CustomApolloProvider>
          <AuthProvider>
            <div className="flex min-h-full flex-col">
              {children}
            </div>
          </AuthProvider>
        </CustomApolloProvider>
      </body>
    </html>
  );
}
