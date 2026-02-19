import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for BuyKoins. How we collect, use, and protect your data when you use our creator earnings withdrawal services.',
  robots: { index: true, follow: true },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
