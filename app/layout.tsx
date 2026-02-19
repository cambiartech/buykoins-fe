import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/lib/toast'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://buykoins.com'
const SITE_NAME = 'BuyKoins'
const DEFAULT_TITLE = 'BuyKoins – Creator Earnings & USD Virtual Cards'
const DEFAULT_DESCRIPTION =
  'Withdraw TikTok earnings. One USD card—load TikTok, send live gifts, pay anywhere. BuyKoins by Cambiar Technologies.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'TikTok creator earnings',
    'withdraw TikTok coins',
    'creator payout',
    'USD virtual card',
    'prepaid card creators',
    'buy gifts for creators',
    'TikTok monetization',
    'creator agency',
    'Cambiar Technologies',
  ],
  authors: [{ name: 'BuyKoins by Cambiar Technologies', url: SITE_URL }],
  creator: 'BuyKoins by Cambiar Technologies',
  publisher: 'BuyKoins by Cambiar Technologies',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'BuyKoins – Creator Earnings & USD Virtual Cards',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ['/og.png'],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Uncomment and set when you have them (Google Search Console, etc.)
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}

function JsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    logo: `${SITE_URL}/logos/logo-colored.png`,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', url: `${SITE_URL}/?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website),
        }}
      />
    </>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <JsonLd />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
