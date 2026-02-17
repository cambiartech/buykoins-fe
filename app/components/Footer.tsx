'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FacebookLogo, LinkedinLogo, YoutubeLogo, InstagramLogo } from '@phosphor-icons/react'

export default function Footer() {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.language-menu-container')) {
        setShowLanguageMenu(false)
      }
    }

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLanguageMenu])

  return (
    <footer className="relative z-10 bg-[#29013a] border-t border-[#29013a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Links - FIRST */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Get Started */}
          <div>
            <h3 className="text-white/80 font-semibold mb-4 text-sm">Get Started</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/signup" className="text-white/70 hover:text-white transition-colors text-sm">
                  Sign up
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white/70 hover:text-white transition-colors text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-white/80 font-semibold mb-4 text-sm">Discover</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white/80 font-semibold mb-4 text-sm">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white/70 hover:text-white transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/partnerships" className="text-white/70 hover:text-white transition-colors text-sm">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/media" className="text-white/70 hover:text-white transition-colors text-sm">
                  Media Assets
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white/80 font-semibold mb-4 text-sm">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-white transition-colors text-sm">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-white/70 hover:text-white transition-colors text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-white/80 font-semibold mb-4 text-sm">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-white/70 hover:text-white transition-colors text-sm">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Support Links Section */}
        <div className="border-b border-white/10 pb-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <Link href="/support" className="text-white hover:text-white/80 transition-colors text-sm font-sequel">
              Live chat
            </Link>
            <Link href="/dashboard" className="text-white hover:text-white/80 transition-colors text-sm font-sequel">
              Client portal
            </Link>
            <Link href="/support" className="text-white hover:text-white/80 transition-colors text-sm font-sequel">
              Knowledge base
            </Link>
          </div>
        </div>

        {/* How can we help? Section */}
        <div className="border-b border-white/10 pb-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-white text-lg sm:text-xl font-sequel mb-2">
                How can we help?{' '}
                <Link href="/support" className="text-[#ff4aff] hover:text-[#ff4aff]/80 underline transition-colors">
                  Contact us.
                </Link>
              </p>
            </div>
            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="X (Twitter)"
              >
                <span className="text-white font-bold text-sm">X</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="Facebook"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="LinkedIn"
              >
                <LinkedinLogo size={20} weight="fill" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="YouTube"
              >
                <YoutubeLogo size={20} weight="fill" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="Instagram"
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                aria-label="TikTok"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Large Logo Section - Bold and Centered */}
        <div className="mb-8 flex justify-center">
          <img
            src="/logos/logo-white.png"
            alt="BuyKoins"
            className="h-24 sm:h-32 md:h-auto w-auto md:w-full"
          />
        </div>

        {/* Bottom Section - Legal Links */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Legal Links */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-sequel">
                Terms of Use
              </Link>
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-sequel">
                Privacy Notice
              </Link>
              <Link href="/cookies" className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-sequel">
                Cookie Notice
              </Link>
              <Link href="/cookies" className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-sequel">
                Cookie settings
              </Link>
              <Link href="/support" className="text-white/70 hover:text-white transition-colors text-xs sm:text-sm font-sequel">
                Trust Center
              </Link>
            </div>
            {/* Copyright & branding */}
            <p className="text-white/60 text-xs font-sequel">
              BuyKoins by Cambiar Technologies · © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
