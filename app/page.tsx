'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { List, X, ArrowRight, Globe, Wallet, ShieldCheck, CreditCard, TrendUp, InstagramLogo, FacebookLogo, Plus, Minus, SignIn, UserPlus, Question, House, LinkedinLogo, YoutubeLogo } from '@phosphor-icons/react'
import Footer from './components/Footer'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail')
    setIsLoggedIn(!!userEmail)
  }, [])

  // Close language menu when clicking outside
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
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/logos/logo-white.png" 
              alt="BuyKoins" 
              className="h-12 w-auto"
            />
            {/* <span className="text-white font-sequel font-bold text-xl sm:text-2xl">BuyKoins</span> */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative language-menu-container">
              <button 
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
              >
                <Globe size={16} weight="regular" />
                <span className="text-sm">EN</span>
              </button>
              {showLanguageMenu && (
                <div className="absolute top-full right-0 mt-2 bg-[#29013a] border border-white/10 rounded-lg shadow-xl py-2 min-w-[120px] z-50">
                  <button 
                    onClick={() => {
                      setShowLanguageMenu(false)
                      // Language change logic here
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors text-sm font-sequel"
                  >
                    English (EN)
                  </button>
                  <button 
                    onClick={() => {
                      setShowLanguageMenu(false)
                      // Language change logic here
                    }}
                    className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/10 transition-colors text-sm font-sequel"
                  >
                    Español (ES)
                  </button>
                  <button 
                    onClick={() => {
                      setShowLanguageMenu(false)
                      // Language change logic here
                    }}
                    className="w-full text-left px-4 py-2 text-white/70 hover:bg-white/10 transition-colors text-sm font-sequel"
                  >
                    Français (FR)
                  </button>
                </div>
              )}
            </div>
            <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="bg-white text-[#29013a] px-6 py-2 rounded-full font-semibold hover:bg-white/90 transition-colors text-sm"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} weight="regular" /> : <List size={24} weight="regular" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 px-4 space-y-4">
            <Link href="/login" className="block text-white/80 hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="block bg-white text-[#29013a] px-6 py-2 rounded-full font-semibold text-center"
            >
              Sign up
            </Link>
          </div>
        )}
      </header>

      {/* Main Content - Hero Section */}
      <main className="relative z-10 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Floating Logos Background - Behind text but visible, hidden on mobile */}
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* BuyKoins Logo - Top Left (Most Prominent) */}
          <div className="absolute top-20 left-4 sm:left-10 w-36 h-36 sm:w-48 sm:h-48 opacity-20 animate-float-slow">
            <img 
              src="/logos/logo-colored.png" 
              alt="BuyKoins" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* BuyKoins Logo - Center Right (Large, prominent) */}
          <div className="absolute top-1/3 right-1/4 w-44 h-44 sm:w-56 sm:h-56 opacity-15 animate-float-delayed">
            <img 
              src="/logos/logo-colored.png" 
              alt="BuyKoins" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Snapchat Logo - Top Right */}
          <div className="absolute top-32 right-4 sm:right-10 w-28 h-28 sm:w-36 sm:h-36 opacity-25 animate-float-delayed">
            <img 
              src="/logos/snapchat.png" 
              alt="Snapchat" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Twitch Logo - Middle Left */}
          <div className="absolute top-1/2 left-8 sm:left-16 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 opacity-22 animate-float-slow">
            <img 
              src="/logos/twitch.png" 
              alt="Twitch" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Silver Coin 1 - Bottom Left */}
          <div className="absolute bottom-32 left-12 sm:left-20 w-28 h-28 sm:w-36 sm:h-36 opacity-25 animate-float-delayed">
            <img 
              src="/logos/silver-coin.png" 
              alt="Coin" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          {/* Silver Coin 2 - Bottom Right */}
          <div className="absolute bottom-20 right-8 sm:right-16 w-32 h-32 sm:w-40 sm:h-40 opacity-23 animate-float-slow">
            <img 
              src="/logos/silver-coin-2.png" 
              alt="Coin" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto w-full">
          {/* Centered Hero Content */}
          <div className="text-center">
            <h1 className="font-monument font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-white leading-tight mb-6">
              Get paid for your
              <br />
              <span className="bg-gradient-to-r from-tiktok-primary to-tiktok-primary/70 bg-clip-text text-transparent">
                creator earnings
              </span>
            </h1>
            <p className="text-white/80 text-lg sm:text-xl mb-8 font-sequel max-w-2xl mx-auto">
              Join our agency and withdraw your creator earnings instantly. 
              Secure, fast, and reliable.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="bg-white text-[#29013a] px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight size={20} weight="regular" />
              </Link>
              <Link 
                href="/dashboard"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all"
              >
                View Dashboard
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-12 flex items-center justify-center space-x-2 text-white/60">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
                <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm font-sequel">Scroll</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section with Scroll Animation */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Stats Section with V Animation */}
      <StatsSection />

      {/* Footer */}
      <Footer />

      {/* Floating CTA - Always Visible */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <div className="bg-[#29013a] rounded-full px-8 py-4 shadow-2xl flex items-center space-x-6 backdrop-blur-sm">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors font-sequel font-semibold"
              >
                <House size={20} weight="regular" />
                <span>Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-white/30"></div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors font-sequel font-semibold"
              >
                <SignIn size={20} weight="regular" />
                <span>Login</span>
              </Link>
              <div className="w-px h-6 bg-white/30"></div>
              <Link
                href="/signup"
                className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors font-sequel font-semibold"
              >
                <UserPlus size={20} weight="regular" />
                <span>Register</span>
              </Link>
              <div className="w-px h-6 bg-white/30"></div>
            </>
          )}
          <button
            onClick={() => {
              // Scroll to FAQ section or open support
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="flex items-center space-x-2 text-white hover:text-white/80 transition-colors font-sequel font-semibold"
          >
            <Question size={20} weight="regular" />
            <span>Support</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Features Section – clean single block with list (no split cards)
function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const features = [
    {
      icon: Wallet,
      title: 'Secure Wallet',
      description: 'Manage your TikTok earnings in a secure wallet with real-time balance tracking.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Agency',
      description: 'Join our verified TikTok creator agency and get instant access to withdrawal services.',
    },
    {
      icon: CreditCard,
      title: 'Bank Integration',
      description: 'Connect your bank account for direct deposits to your local currency.',
    },
    {
      icon: TrendUp,
      title: 'Track Earnings',
      description: 'Monitor your earnings growth and withdrawal history with detailed analytics.',
    },
  ]

  useEffect(() => {
    if (!sectionRef.current) return
    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[]
    if (items.length === 0) return
    items.forEach((item) => gsap.set(item, { opacity: 0, y: 24 }))
    items.forEach((item, i) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        delay: i * 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'top 40%',
          scrub: 1,
        },
      })
    })
    return () => ScrollTrigger.getAll().forEach((t) => t.kill())
  }, [])

  return (
    <section ref={sectionRef} className="relative z-10 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-[#29013a] font-monument font-bold text-3xl sm:text-4xl lg:text-5xl mb-3">
            Why Choose Us
          </h2>
          <p className="text-[#29013a]/70 text-lg font-sequel max-w-xl mx-auto">
            Everything you need to manage and withdraw your creator earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                ref={(el) => { itemsRef.current[index] = el }}
                className="flex gap-4 p-5 sm:p-6 rounded-2xl bg-[#29013a]/05 border border-[#29013a]/10 hover:border-[#29013a]/20 hover:bg-[#29013a]/08 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#29013a] flex items-center justify-center">
                  <Icon size={24} weight="regular" className="text-white" />
                </div>
                <div>
                  <h3 className="text-[#29013a] font-monument font-bold text-lg mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[#29013a]/70 text-sm font-sequel leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// FAQ Section Component with GSAP Animation
function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'How do I link my creator account?',
      answer: 'To link your creator account, go to your dashboard and click on "Link Account". Follow the simple verification process to connect your account and set us as your payment method.',
    },
    {
      question: 'How long does it take to process withdrawals?',
      answer: 'Withdrawals are typically processed within 24-48 hours after admin verification. Once approved, funds are credited to your local bank account.',
    },
    {
      question: 'What are the fees for withdrawals?',
      answer: 'Our withdrawal fees are competitive and transparent. Check the Fees section in your dashboard for detailed information based on your withdrawal amount.',
    },
    {
      question: 'Is my account secure?',
      answer: 'Yes, we use bank-level encryption and security measures to protect your account and financial information. All transactions are secure and verified.',
    },
    {
      question: 'Can I withdraw to any bank account?',
      answer: 'Yes, you can add and verify any bank account in your dashboard. Once verified, you can withdraw your earnings directly to that account.',
    },
    {
      question: 'What happens if my withdrawal is rejected?',
      answer: 'If a withdrawal is rejected, you will receive a notification with the reason. You can review the issue and resubmit your withdrawal request.',
    },
  ]

  useEffect(() => {
    if (!sectionRef.current) return

    const items = itemsRef.current.filter(Boolean) as HTMLDivElement[]
    if (items.length === 0) return

    // Set initial state - items hidden
    items.forEach((item) => {
      gsap.set(item, {
        opacity: 0,
        y: 50,
      })
    })

    // Animate items in on scroll
    items.forEach((item, index) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 1,
        },
      })
    })

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section ref={sectionRef} className="relative z-10 bg-black py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-white font-monument font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-white/70 text-lg font-sequel">
            Everything you need to know about withdrawing your creator earnings
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              ref={(el) => {
                itemsRef.current[index] = el
              }}
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-semibold text-lg pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <Minus size={24} weight="bold" className="text-tiktok-primary" />
                  ) : (
                    <Plus size={24} weight="bold" className="text-tiktok-primary" />
                  )}
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5">
                  <p className="text-white/70 text-sm sm:text-base font-sequel leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials Section Component with Glassmorphism and Scroll Animation
function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  const testimonials = [
    {
      name: 'Chukwuemeka O.',
      initials: 'CO',
      color: 'bg-green-500',
      rating: 'Recommended',
      text: 'Very happy with the platform. Does what it says, simple payments and transactions. Quick account verification and withdrawals. 24/7 support available.',
    },
    {
      name: 'Amina B.',
      initials: 'AB',
      color: 'bg-blue-500',
      rating: '',
      text: 'Awesome platform very user friendly. Would highly recommend BuyKoins to my friends.',
    },
    {
      name: 'Kwame A.',
      initials: 'KA',
      color: 'bg-yellow-500',
      rating: '',
      text: "I've been a user for a few months! The support was always great and I'm always able to withdraw my creator earnings with no problem.",
    },
    {
      name: 'Fatima I.',
      initials: 'FI',
      color: 'bg-purple-500',
      rating: '',
      text: 'Fast and reliable service. Got my earnings transferred to my local bank account within 24 hours. Highly recommended!',
    },
  ]

  useEffect(() => {
    if (!sectionRef.current) return

    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[]
    if (cards.length === 0) return

    // Set initial state - cards hidden and positioned
    cards.forEach((card, index) => {
      gsap.set(card, {
        opacity: 0,
        y: 100,
        rotation: 5,
        scale: 0.9,
      })
    })

    // Create scroll timeline
    cards.forEach((card, index) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          end: 'top 50%',
          scrub: 1,
        },
      })
    })

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 sm:py-32 overflow-hidden"
      style={{
        backgroundImage: 'url(/bg/testimonials.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-white font-monument font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            Hear it from our clients
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              {testimonial.rating && (
                <div className="text-white font-semibold text-sm mb-3 text-tiktok-primary">
                  {testimonial.rating}
                </div>
              )}
              <p className="text-white text-sm sm:text-base mb-4 font-sequel leading-relaxed">
                {testimonial.text}
              </p>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">
                    {testimonial.initials}
                  </span>
                </div>
                <span className="text-white font-semibold text-sm">
                  {testimonial.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Stats Section with Slide Animation
function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const redOverlayRef = useRef<HTMLDivElement>(null)
  const firstLineRef = useRef<HTMLSpanElement>(null)
  const secondLineRef = useRef<HTMLSpanElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !redOverlayRef.current || !firstLineRef.current || !secondLineRef.current || !subtextRef.current || !buttonRef.current) return

    // Set initial state - Red covers everything
    gsap.set(redOverlayRef.current, {
      y: 0,
    })
    
    // All elements start hidden and positioned
    gsap.set(firstLineRef.current, {
      opacity: 0,
      y: 30,
      color: '#ffffff',
    })
    gsap.set(secondLineRef.current, {
      opacity: 0,
      y: 30,
      color: '#ffffff',
    })
    gsap.set(subtextRef.current, {
      opacity: 0,
      y: 30,
      color: '#ffffff',
    })
    gsap.set(buttonRef.current, {
      opacity: 0,
      y: 30,
      backgroundColor: '#ffffff',
      color: '#29013a',
    })

    // Create scroll timeline - longer scroll distance for better experience
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=500%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })

    // Stage 1: "1 million users," appears (0-15%)
    tl.to(firstLineRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power2.out',
    })

    // Stage 2: Hold and read (15-25%)
    tl.to({}, {
      duration: 0.1,
    })

    // Stage 3: "plus you." appears (25-40%)
    tl.to(secondLineRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power2.out',
    })

    // Stage 4: Hold and read (40-50%)
    tl.to({}, {
      duration: 0.1,
    })

    // Stage 5: Subtext appears (50-65%)
    tl.to(subtextRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power2.out',
    })

    // Stage 6: Hold and read (65-75%)
    tl.to({}, {
      duration: 0.1,
    })

    // Stage 7: Button appears (75-85%)
    tl.to(buttonRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.15,
      ease: 'power2.out',
    })

    // Stage 8: Hold and enjoy the solid red (85-100%)
    tl.to({}, {
      duration: 0.15,
    })

    // Stage 9: Red slides up smoothly, revealing white from bottom to top (100%+)
    tl.to(redOverlayRef.current, {
      y: '-100%',
      duration: 0.5,
      ease: 'power2.inOut',
    })

    // Text changes from white to pink as red slides up
    tl.to(
      firstLineRef.current,
      {
        color: '#ff4aff',
        duration: 0.5,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      secondLineRef.current,
      {
        color: '#ff4aff',
        duration: 0.5,
        ease: 'power2.inOut',
      },
      '<'
    )
    tl.to(
      subtextRef.current,
      {
        color: '#ff4aff',
        duration: 0.5,
        ease: 'power2.inOut',
      },
      '<'
    )
    
    // Button changes from white to soft purple background with deep purple text
    tl.to(
      buttonRef.current,
      {
        backgroundColor: '#ff4aff',
        color: '#29013a',
        duration: 0.5,
        ease: 'power2.inOut',
      },
      '<'
    )

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative z-10 bg-white overflow-hidden min-h-screen">
      {/* Soft Purple overlay - starts covering everything, slides up to reveal white from bottom */}
      <div
        ref={redOverlayRef}
        className="absolute top-0 left-0 right-0 h-full bg-tiktok-primary"
      />

      {/* Content - always visible, positioned correctly */}
      <div className="relative z-20 pt-40 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center w-full">
          <h2 className="font-monument font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6">
            <span ref={firstLineRef} className="text-white">
              1 million users,
            </span>
            <br />
            <span ref={secondLineRef} className="text-white">
              plus you.
            </span>
          </h2>
          <p ref={subtextRef} className="text-white text-lg sm:text-xl font-sequel mb-8">
            It only takes few seconds to get started.
          </p>
          <Link
            ref={buttonRef}
            href="/signup"
            className="inline-flex items-center space-x-2 bg-white text-[#29013a] px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all transform hover:scale-105"
          >
            <span>Get Started</span>
            <ArrowRight size={20} weight="regular" />
          </Link>
        </div>
      </div>
    </section>
  )
}
