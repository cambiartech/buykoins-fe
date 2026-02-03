'use client'

import Link from 'next/link'
import { ArrowLeft, Warning } from '@phosphor-icons/react'

export default function NotFound() {
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

        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="font-monument font-bold text-8xl sm:text-9xl lg:text-[12rem] text-[#ff4aff] mb-4">
            404
          </h1>
        </div>

      
        {/* Heading */}
        <h2 className="font-monument font-bold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-white/70 text-lg sm:text-xl font-sequel mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 bg-[#ff4aff] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#ff4aff]/90 transition-all transform hover:scale-105"
          >
            <ArrowLeft size={20} weight="regular" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all border border-white/20"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
