'use client'

import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import Footer from '../components/Footer'

const LAST_UPDATED = 'February 2025'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
            <img src="/logos/logo-colored.png" alt="BuyKoins" className="h-8 w-auto" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#29013a] hover:underline"
          >
            <ArrowLeft size={18} weight="regular" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="font-monument font-bold text-3xl sm:text-4xl text-[#29013a] mb-2">
          Terms of Service
        </h1>
        <p className="text-gray-500 text-sm font-sequel mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose prose-gray max-w-none font-sequel text-gray-700 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">1. Introduction and Acceptance</h2>
            <p className="text-sm leading-relaxed mb-3">
              These Terms of Service (&quot;Terms&quot;) govern your use of the services provided by BuyKoins
              (&quot;we,&quot; &quot;us,&quot; or &quot;the Agency&quot;). We operate as a creator agency that facilitates the
              receipt and withdrawal of creator earnings from eligible platforms (including TikTok) to
              you. By creating an account, linking your creator account, or using our services, you agree
              to be bound by these Terms. If you do not agree, you must not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">2. Definitions</h2>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              <li><strong>Creator</strong> means you, the individual who has earned or may earn revenue from a supported platform and who uses our services to withdraw those earnings.</li>
              <li><strong>Creator Earnings</strong> means revenue or payments attributable to your creator activity on a supported platform that we facilitate for withdrawal.</li>
              <li><strong>Services</strong> means our agency services, including account facilitation, verification, withdrawal processing, and related support.</li>
              <li><strong>Supported Platform</strong> means TikTok and any other platform we support from time to time for the purpose of facilitating withdrawals of creator earnings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">3. Eligibility</h2>
            <p className="text-sm leading-relaxed mb-3">
              You must be at least 18 years of age (or the age of majority in your jurisdiction) and have
              the legal capacity to enter into a binding agreement. You must be the rightful owner or
              authorized beneficiary of the creator account and earnings you link to our services. We
              reserve the right to verify your identity and eligibility and to refuse or suspend service
              where we reasonably believe you do not meet these requirements or have violated
              platform or legal requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">4. Nature of the Agency Relationship</h2>
            <p className="text-sm leading-relaxed mb-3">
              We act as a service provider and facilitator between you and the supported platform (and
              payment channels) for the purpose of enabling you to receive and withdraw your creator
              earnings. We are not your employer, and no employment or agency relationship is created
              between you and us beyond the scope of these Terms. We do not own your content, your
              creator identity, or your relationship with the supported platform. Our role is limited to
              verifying your eligibility, facilitating the transfer of your earnings in accordance with
              platform and payment-partner rules, and applying our fees as disclosed to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">5. Account, Verification, and Security</h2>
            <p className="text-sm leading-relaxed mb-3">
              You must open an account with us and provide accurate, complete, and current
              information. You must link your creator account (e.g., TikTok) as required and complete
              any identity or verification steps we or our partners require, including where necessary
              for anti–money laundering (AML), know-your-customer (KYC), or tax compliance. You are
              responsible for maintaining the confidentiality of your account credentials and for all
              activity under your account. You must notify us promptly of any unauthorized access or
              suspected breach.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">6. Creator Earnings and Withdrawals</h2>
            <p className="text-sm leading-relaxed mb-3">
              We facilitate the withdrawal of creator earnings that are made available to us through the
              supported platform and our payment partners. Eligibility for withdrawal, timing, and
              availability of funds depend on the rules of the supported platform and our partners. We
              will credit your earnings balance and process withdrawals to your designated bank
              account (or other permitted method) in accordance with our then-current processing
              schedules and policies. We may impose minimum withdrawal amounts and may deduct
              applicable fees and taxes (or require you to bear tax obligations) as disclosed at the time
              of withdrawal or in our fee schedule.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">7. Fees and Charges</h2>
            <p className="text-sm leading-relaxed mb-3">
              Our fees for agency and withdrawal services will be disclosed to you before you
              complete a withdrawal or as part of our published fee schedule. Fees may vary by
              region, withdrawal method, or amount. By using the withdrawal service, you agree to
              the fees applicable at that time. We may change fees on reasonable notice; continued
              use after the change constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">8. Your Obligations</h2>
            <p className="text-sm leading-relaxed mb-3">
              You agree to: (a) comply with all applicable laws and the terms and policies of the
              supported platform; (b) provide only accurate information and not misrepresent your
              identity or entitlement to earnings; (c) not use the services for any fraudulent or illegal
              purpose; (d) not attempt to circumvent our or the platform&apos;s security or verification
              processes; and (e) cooperate with reasonable requests we make for verification or
              compliance. Breach of these obligations may result in suspension or termination of your
              account and forfeiture of pending earnings where permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">9. Prohibited Conduct</h2>
            <p className="text-sm leading-relaxed mb-3">
              You must not use our services to launder money, evade sanctions, finance illegal
              activity, or violate any applicable law or platform policy. You must not abuse our systems,
              attempt to gain unauthorized access, or use the services in a way that harms us, other
              users, or third parties. We may report suspicious or illegal activity to the relevant
              authorities and take any action we reasonably consider necessary to protect the
              integrity of our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">10. Intellectual Property and Licence</h2>
            <p className="text-sm leading-relaxed mb-3">
              We do not claim ownership of your content, creator profile, or any intellectual property
              you own. You grant us a limited licence to use your name, creator identity, and related
              information only as necessary to provide the services (e.g., verification, reporting to
              platforms or regulators). Our name, logo, and platform are our intellectual property; you
              may not use them without our prior written consent except as necessary to use the
              services in the ordinary course.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">11. Termination</h2>
            <p className="text-sm leading-relaxed mb-3">
              You may close your account at any time by contacting us or through account settings
              where available. We may suspend or terminate your account or access to the services
              with or without notice if we reasonably believe you have breached these Terms, violated
              law or platform policies, or for operational, legal, or risk reasons. Upon termination,
              your right to use the services ceases. We will process any eligible balance in accordance
              with our policies and applicable law, subject to our right to withhold amounts for fees,
              chargebacks, or where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">12. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed mb-3">
              To the maximum extent permitted by applicable law, we and our affiliates, directors,
              employees, and agents shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, or for loss of profits, data, or goodwill, arising from
              or in connection with the services or these Terms. Our total liability for any claims
              arising from or related to the services or these Terms shall not exceed the greater of (a)
              the fees you paid to us in the twelve (12) months preceding the claim, or (b) one
              hundred United States dollars (USD 100). Some jurisdictions do not allow certain
              limitations of liability; in such jurisdictions, our liability will be limited to the fullest
              extent permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">13. Indemnification</h2>
            <p className="text-sm leading-relaxed mb-3">
              You agree to indemnify, defend, and hold harmless BuyKoins and its affiliates, officers,
              directors, employees, and agents from and against any claims, damages, losses,
              liabilities, and expenses (including reasonable legal fees) arising from (a) your use of
              the services, (b) your breach of these Terms or any applicable law, (c) your creator
              content or conduct, or (d) any dispute between you and a third party (including the
              supported platform) in connection with your creator activity or earnings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">14. Dispute Resolution and Governing Law</h2>
            <p className="text-sm leading-relaxed mb-3">
              These Terms are governed by the laws of the Federal Republic of Nigeria, without regard
              to its conflict of laws principles. Any dispute arising out of or relating to these Terms or
              the services shall first be addressed through good-faith negotiation. If the dispute cannot
              be resolved within thirty (30) days, it may be referred to the courts of Nigeria, and you
              consent to the exclusive jurisdiction of such courts. Nothing in this section prevents
              either party from seeking injunctive or other equitable relief in any court of competent
              jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">15. Changes to the Terms</h2>
            <p className="text-sm leading-relaxed mb-3">
              We may update these Terms from time to time. We will notify you of material changes by
              posting the updated Terms on our website and updating the &quot;Last updated&quot; date, or by
              email or in-app notice where appropriate. Your continued use of the services after the
              effective date of the changes constitutes acceptance of the revised Terms. If you do not
              agree, you must stop using the services and may close your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">16. General</h2>
            <p className="text-sm leading-relaxed mb-3">
              These Terms, together with our Privacy Policy and any additional terms we present to you
              for specific features, constitute the entire agreement between you and BuyKoins
              regarding the services. No waiver of any term shall be deemed a further or continuing
              waiver. If any provision is held invalid or unenforceable, the remaining provisions
              remain in effect. We may assign our rights and obligations under these Terms; you may
              not assign without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">17. Contact</h2>
            <p className="text-sm leading-relaxed mb-3">
              For questions about these Terms or our services, please contact us via the support
              options available in your dashboard or at our website.
            </p>
          </section>
        </div>

      </main>

      {/* Main site footer */}
      <Footer />
    </div>
  )
}
