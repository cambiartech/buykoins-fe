import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of Service for BuyKoins creator earnings withdrawal platform. Read our agency terms, fees, and user obligations.',
  robots: { index: true, follow: true },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
