import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your BuyKoins account to start withdrawing your TikTok and creator earnings.',
  robots: { index: true, follow: true },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
