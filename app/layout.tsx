import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Karuna Technologies - Digital Innovation Partner',
    template: '%s | Karuna Technologies'
  },
  description: 'Web design, hosting, automation, and mobile app development services. We build smarter digital solutions.',
  keywords: ['web design', 'hosting', 'automation', 'mobile apps', 'software company'],
  authors: [{ name: 'Karuna Technologies' }],
  creator: 'Karuna Technologies',
  publisher: 'Karuna Technologies',
  openGraph: {
    title: 'Karuna Technologies',
    description: 'We build smarter digital solutions — web design, hosting, automation & mobile apps.',
    url: 'https://karunatechnologies.com',
    siteName: 'Karuna Technologies',
    images: [
      {
        url: 'https://karunatechnologies.com/og-image.jpg', // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: 'Karuna Technologies',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Karuna Technologies',
    description: 'We build smarter digital solutions — web design, hosting, automation & mobile apps.',
    images: ['https://karunatechnologies.com/twitter-image.jpg'], // Replace with actual image
  },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}