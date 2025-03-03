import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Prototype Cafe',
    // description: 'Next.js App Router プロジェクト',
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="ja">
            <body className={inter.className}>
                <Navigation />
                <main className="container">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
} 