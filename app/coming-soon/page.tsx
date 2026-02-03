'use client'

import Link from 'next/link'
import { ArrowLeft, Clock } from '@phosphor-icons/react'

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 opacity-20">
          <img 
            src="/logos/logo-colored.png" 
            alt="BuyKoins" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute bottom-20 right-10 w-48 h-48 opacity-15">
          <img 
            src="/logos/logo-colored.png" 
            alt="BuyKoins" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logos/logo-white.png" 
            alt="BuyKoins" 
            className="h-16 w-auto"
          />
        </div>

        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-[#ff4aff]/20 flex items-center justify-center">
            <Clock size={48} weight="regular" className="text-[#ff4aff]" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-monument font-bold text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
          Coming Soon
        </h1>

        {/* Description */}
        <p className="text-white/70 text-lg sm:text-xl font-sequel mb-8 max-w-md mx-auto">
          We're working hard to bring you an amazing mobile experience. Our apps will be available on Google Play and the App Store soon!
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2 font-sequel">Mobile App</h3>
            <p className="text-white/60 text-sm font-sequel">
              Access your account on the go with our native mobile apps
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-2 font-sequel">Push Notifications</h3>
            <p className="text-white/60 text-sm font-sequel">
              Get instant updates about your transactions and earnings
            </p>
          </div>
        </div>

        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-[#ff4aff] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#ff4aff]/90 transition-all transform hover:scale-105"
        >
          <ArrowLeft size={20} weight="regular" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}
