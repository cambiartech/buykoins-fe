'use client'

import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import Footer from '../components/Footer'

const LAST_UPDATED = 'February 2025'

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-gray-500 text-sm font-sequel mb-10">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="prose prose-gray max-w-none font-sequel text-gray-700 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">1. Who We Are</h2>
            <p className="text-sm leading-relaxed mb-3">
              BuyKoins (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates as a creator agency that facilitates the
              withdrawal of creator earnings from supported platforms (including TikTok) to creators.
              This Privacy Policy explains how we collect, use, disclose, and protect your personal
              data when you use our website, services, and related platforms. We are the data
              controller in respect of the personal data we process for our agency services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">2. Data We Collect</h2>
            <p className="text-sm leading-relaxed mb-3">
              We may collect and process the following categories of personal data:
            </p>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-2">
              <li><strong>Identity and contact information:</strong> name, email address, phone number, date of birth (where required for verification).</li>
              <li><strong>Account and authentication data:</strong> login credentials, account identifiers, and (where you sign in via a third party such as TikTok) the identifiers and profile information (e.g., display name, avatar) that the platform provides to us with your consent.</li>
              <li><strong>Financial and payment data:</strong> bank account details, payment method information, transaction history, and earnings-related data necessary to process withdrawals and comply with financial regulations.</li>
              <li><strong>Identity verification and KYC data:</strong> government-issued ID details, proof of address, or other information we or our regulated partners require for anti–money laundering (AML), know-your-customer (KYC), or fraud prevention.</li>
              <li><strong>Technical and usage data:</strong> IP address, device information, browser type, log data, and information about how you use our website and services (e.g., pages visited, actions taken).</li>
              <li><strong>Communications:</strong> records of your communications with us (e.g., support tickets, chat logs) and any feedback you provide.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">3. How We Use Your Data</h2>
            <p className="text-sm leading-relaxed mb-3">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              <li>To create and manage your account and to authenticate you (including via third-party sign-in where you choose that option).</li>
              <li>To verify your identity and eligibility in line with AML, KYC, and platform requirements.</li>
              <li>To facilitate and process the receipt and withdrawal of your creator earnings, including sharing necessary data with payment partners and supported platforms.</li>
              <li>To communicate with you about your account, transactions, security, and support requests.</li>
              <li>To comply with legal and regulatory obligations (e.g., tax, anti-fraud, sanctions screening).</li>
              <li>To protect the security and integrity of our services and to detect, prevent, and investigate fraud or abuse.</li>
              <li>To improve our services, carry out analytics (in anonymised or aggregated form where possible), and to personalise your experience where lawful.</li>
              <li>To send you service-related or marketing communications where you have consented or where we have a legitimate interest and the law allows.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">4. Legal Basis for Processing</h2>
            <p className="text-sm leading-relaxed mb-3">
              We process your personal data on the following bases: (a) <strong>performance of a
              contract</strong>—to provide our agency and withdrawal services; (b) <strong>legal
              obligation</strong>—to meet AML, KYC, tax, and other regulatory requirements; (c)
              <strong>legitimate interests</strong>—to operate and secure our services, prevent fraud, and
              improve our offerings, where not overridden by your rights; and (d) <strong>consent</strong>—where
              we have asked for your consent (e.g., for marketing or for linking a third-party account).
              You may withdraw consent where it applies, without affecting the lawfulness of processing
              before withdrawal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">5. Sharing and Disclosure</h2>
            <p className="text-sm leading-relaxed mb-3">
              We may share your personal data with:
            </p>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              <li><strong>Supported platforms and payment partners</strong>—to facilitate earnings and withdrawals and to comply with their and our policies.</li>
              <li><strong>Service providers</strong>—such as hosting, analytics, identity verification, and payment processors, who process data on our instructions and are bound by confidentiality and data protection obligations.</li>
              <li><strong>Regulators and authorities</strong>—when required by law (e.g., tax, AML, court order) or to protect our or others&apos; rights and safety.</li>
              <li><strong>Professional advisers</strong>—e.g., lawyers or auditors, where necessary for our legitimate business purposes.</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              We do not sell your personal data to third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">6. Data Retention</h2>
            <p className="text-sm leading-relaxed mb-3">
              We retain your personal data for as long as necessary to provide our services, comply
              with legal and regulatory obligations (e.g., tax and AML retention periods, which may
              extend several years), resolve disputes, and enforce our agreements. When data is no
              longer needed, we securely delete or anonymise it in accordance with our retention
              policy and applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">7. Your Rights</h2>
            <p className="text-sm leading-relaxed mb-3">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="list-disc pl-5 text-sm leading-relaxed space-y-1">
              <li><strong>Access</strong>—request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification</strong>—request correction of inaccurate or incomplete data.</li>
              <li><strong>Erasure</strong>—request deletion of your data, subject to legal and contractual exceptions.</li>
              <li><strong>Restriction</strong>—request that we limit processing in certain circumstances.</li>
              <li><strong>Data portability</strong>—receive your data in a structured, machine-readable format where applicable.</li>
              <li><strong>Object</strong>—object to processing based on legitimate interests or for direct marketing.</li>
              <li><strong>Withdraw consent</strong>—where processing is based on consent.</li>
              <li><strong>Complain</strong>—lodge a complaint with a supervisory authority in your country.</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              To exercise these rights, please contact us using the support or contact options in your
              dashboard or on our website. We will respond within the timeframes required by
              applicable law. In Nigeria, you may have additional rights under the Nigeria Data
              Protection Regulation (NDPR); we will honour them where they apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">8. Security</h2>
            <p className="text-sm leading-relaxed mb-3">
              We implement appropriate technical and organisational measures to protect your
              personal data against unauthorised access, loss, or misuse. These include encryption,
              access controls, and secure processing by our partners. No method of transmission or
              storage is completely secure; we encourage you to use strong credentials and to
              protect your account information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">9. Cookies and Similar Technologies</h2>
            <p className="text-sm leading-relaxed mb-3">
              We use cookies and similar technologies to operate our website, authenticate users,
              remember preferences, and analyse usage. You can manage cookie preferences through
              your browser settings or our cookie banner where provided. Disabling certain cookies
              may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">10. International Transfers</h2>
            <p className="text-sm leading-relaxed mb-3">
              Your data may be processed in or transferred to countries outside your residence,
              including for hosting and service providers. We ensure that such transfers are subject
              to appropriate safeguards (e.g., standard contractual clauses or adequacy decisions)
              as required by applicable data protection law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">11. Children</h2>
            <p className="text-sm leading-relaxed mb-3">
              Our services are not directed at individuals under the age of 18. We do not knowingly
              collect personal data from children. If you believe we have collected data from a child,
              please contact us and we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">12. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed mb-3">
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by posting the updated policy on our website and updating the &quot;Last updated&quot;
              date, or by email or in-app notice where appropriate. We encourage you to review this
              policy periodically. Your continued use of our services after the effective date of
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#29013a] mb-3">13. Contact</h2>
            <p className="text-sm leading-relaxed mb-3">
              For questions about this Privacy Policy or to exercise your data protection rights,
              please contact us via the support or contact options available in your dashboard or on
              our website.
            </p>
          </section>
        </div>

      </main>

      {/* Main site footer */}
      <Footer />
    </div>
  )
}
