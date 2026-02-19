import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to your BuyKoins account to manage withdrawals and creator earnings.',
  robots: { index: true, follow: true },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
