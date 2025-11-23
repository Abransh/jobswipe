// TEMP: Commented out Google Fonts for offline build
// import { Inter, JetBrains_Mono } from 'next/font/google';
import { Metadata } from 'next';
import { Toaster } from 'sonner';

import '@/styles/globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueueStatusProvider } from '@/providers/QueueStatusProvider';
import { SpeedInsights } from "@vercel/speed-insights/next"


// TEMP: Using system fonts for offline build
// Premium font loading with SF Pro Display-inspired weights
// const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-inter',
//   display: 'swap',
//   // Load all weights for premium typography system
//   weight: ['200', '300', '400', '500', '600', '700'],
//   // Enable variable font for smoother weights
//   preload: true,
// });

// const jetbrainsMono = JetBrains_Mono({
//   subsets: ['latin'],
//   variable: '--font-jetbrains-mono',
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: {
    default: 'JobSwipe - Automate Your Job Applications',
    template: '%s | JobSwipe',
  },
  description: 'Streamline your job search with AI-powered application automation, resume optimization, and application tracking.',
  keywords: [
    'job search',
    'application automation',
    'resume builder',
    'job tracking',
    'career tools',
    'AI-powered',
  ],
  authors: [
    {
      name: 'JobSwipe Team',
      url: 'https://jobswipe.io',
    },
  ],
  creator: 'JobSwipe',
  publisher: 'JobSwipe',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://jobswipe.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobswipe.io',
    siteName: 'JobSwipe',
    title: 'JobSwipe - Automate Your Job Applications',
    description: 'Streamline your job search with AI-powered application automation, resume optimization, and application tracking.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobSwipe - Automate Your Job Applications',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobSwipe - Automate Your Job Applications',
    description: 'Streamline your job search with AI-powered application automation, resume optimization, and application tracking.',
    images: ['/images/twitter-image.png'],
    creator: '@jobswipe',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className="min-h-screen bg-background font-sans antialiased"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <AuthProvider>
          <SpeedInsights/>
          <QueueStatusProvider>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
            </div>
          </QueueStatusProvider>
        </AuthProvider>
        <Toaster
          position="top-right"
          richColors
          expand={false}
          duration={4000}
          closeButton
        />
      </body>
    </html>
  );
}