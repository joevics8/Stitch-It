import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { CookieBanner } from '@/components/CookieBanner';
import { Toaster } from '@/components/ui/toaster';
import { fraunces, inter, plexMono } from '@/lib/fonts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://stitch-it.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Stitch-It — Get Your Measurements From Two Photos',
    template: '%s | Stitch-It',
  },
  description: 'Take a front and side photo, enter your height, and get your body measurements estimated for tailoring — no tape measure needed.',
  themeColor: '#0F1B33',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Stitch-It',
    title: 'Stitch-It — Get Your Measurements From Two Photos',
    description: 'Take a front and side photo, enter your height, and get your body measurements estimated for tailoring.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Stitch-It' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stitch-It — Get Your Measurements From Two Photos',
    description: 'Take a front and side photo, enter your height, and get your body measurements estimated for tailoring.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <head>
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){ dataLayer.push(arguments); }
            window.gtag = gtag;
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'denied',
              wait_for_update: 500
            });
          `}
        </Script>
        {/* GA4 / AdSense script tags go back here once a Stitch-It
            property + AdSense account IDs are issued. */}
      </head>
      <body>
        <div className="min-h-screen flex flex-col pb-16 md:pb-0">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <BottomNav />
        <Toaster />
        <CookieBanner />
      </body>
    </html>
  );
}
