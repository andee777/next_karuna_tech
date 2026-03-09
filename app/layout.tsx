import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: 'Karuna Technologies - Web Design, Hosting & Automation Experts',
    template: '%s | Karuna Technologies'
  },
  description: 'Professional web design, website hosting, database hosting, automation services, and mobile app development. We build smarter digital solutions for businesses.',
  
  // Canonical URL
  metadataBase: new URL('https://karunatechnologies.com'),
  alternates: {
    canonical: '/',
  },

  // Open Graph for social sharing [citation:1]
  openGraph: {
    title: 'Karuna Technologies - Digital Innovation Partner',
    description: 'Web design, hosting, automation, and mobile app development services.',
    url: 'https://karunatechnologies.com',
    siteName: 'Karuna Technologies',
    images: [
      {
        url: '/og-image.jpg', // Create this image (1200×630px recommended)
        width: 1200,
        height: 630,
        alt: 'Karuna Technologies - Digital Solutions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  // Twitter Cards [citation:1]
  twitter: {
    card: 'summary_large_image',
    title: 'Karuna Technologies',
    description: 'Web design, hosting, automation & mobile apps.',
    images: ['/twitter-image.jpg'], // Create this image
    creator: '@karunatech', // Your Twitter handle
  },

  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification for search consoles
  verification: {
    google: 'your-google-verification-code', // Add from Google Search Console
    yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <Navbar />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}