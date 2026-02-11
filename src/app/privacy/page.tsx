import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SongSwipe Privacy Policy - how we collect, use, and protect your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-heading font-bold mb-2 text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Who We Are</h2>
            <p className="text-zinc-400 leading-relaxed">
              SongSwipe (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a personalised AI song creation service. We are the data controller responsible for your personal data. If you have any questions about this policy or your data, contact us at{' '}
              <a href="mailto:privacy@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">privacy@songswipe.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. What Data We Collect</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-200">Account data:</strong> Your name and email address when you sign up (via email/password or Google OAuth).</p>
              <p><strong className="text-zinc-200">Song personalisation data:</strong> Recipient names, special memories, occasion details, and any other information you provide to personalise your song.</p>
              <p><strong className="text-zinc-200">Payment data:</strong> Payment transactions are processed by Stripe. We do not store your card number, expiry date, or CVV. We receive a transaction reference and payment status from Stripe.</p>
              <p><strong className="text-zinc-200">Song audio files:</strong> The AI-generated songs created for you, stored securely so you can access and download them.</p>
              <p><strong className="text-zinc-200">Technical data:</strong> Your browser type, IP address, and how you interact with our site (e.g. pages visited). This is collected automatically by our hosting provider.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Why We Collect It</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-200">To deliver our service:</strong> We need your personalisation details to generate your song, your email to create your account, and payment information to process your order.</p>
              <p><strong className="text-zinc-200">To improve our service:</strong> We may analyse usage patterns (in aggregate, not individually) to make SongSwipe better.</p>
              <p><strong className="text-zinc-200">To communicate with you:</strong> Order confirmations, gift delivery notifications, and essential service updates.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Legal Basis for Processing</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-200">Contract performance:</strong> Processing your data is necessary to fulfil your song order and deliver the service you paid for.</p>
              <p><strong className="text-zinc-200">Legitimate interest:</strong> Improving our service, preventing fraud, and ensuring security.</p>
              <p><strong className="text-zinc-200">Consent:</strong> If we introduce marketing emails in the future, we will ask for your explicit consent first.</p>
              <p><strong className="text-zinc-200">Legal obligation:</strong> We retain payment records for 6 years as required by HMRC.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Who We Share Data With</h2>
            <p className="text-zinc-400 leading-relaxed mb-3">We share your data only with the service providers necessary to run SongSwipe:</p>
            <div className="bg-surface-50 border border-surface-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-300">Provider</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-300">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-zinc-300">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  <tr>
                    <td className="px-4 py-3 text-zinc-200">Supabase</td>
                    <td className="px-4 py-3 text-zinc-400">Database, authentication</td>
                    <td className="px-4 py-3 text-zinc-400">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-200">Stripe</td>
                    <td className="px-4 py-3 text-zinc-400">Payment processing</td>
                    <td className="px-4 py-3 text-zinc-400">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-200">ElevenLabs</td>
                    <td className="px-4 py-3 text-zinc-400">AI song generation</td>
                    <td className="px-4 py-3 text-zinc-400">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-200">Vercel</td>
                    <td className="px-4 py-3 text-zinc-400">Website hosting</td>
                    <td className="px-4 py-3 text-zinc-400">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-zinc-200">Resend</td>
                    <td className="px-4 py-3 text-zinc-400">Transactional emails</td>
                    <td className="px-4 py-3 text-zinc-400">US (EU SCCs)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-zinc-400 leading-relaxed mt-3">
              Where data is transferred outside the UK/EEA, we ensure appropriate safeguards are in place (Standard Contractual Clauses). We do not sell your data to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. How Long We Keep Your Data</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-200">Account data:</strong> Kept until you request deletion of your account.</p>
              <p><strong className="text-zinc-200">Song audio files:</strong> Kept for 12 months after creation, then automatically deleted.</p>
              <p><strong className="text-zinc-200">Song personalisation data:</strong> Kept for 12 months after creation alongside the song.</p>
              <p><strong className="text-zinc-200">Payment records:</strong> Kept for 6 years as required by HMRC for tax purposes.</p>
              <p><strong className="text-zinc-200">Technical logs:</strong> Kept for up to 30 days by our hosting provider.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="text-zinc-400 leading-relaxed mb-3">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li><strong className="text-zinc-200">Access</strong> your personal data (request a copy of what we hold)</li>
              <li><strong className="text-zinc-200">Rectification</strong> of inaccurate data</li>
              <li><strong className="text-zinc-200">Erasure</strong> of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong className="text-zinc-200">Data portability</strong> (receive your data in a machine-readable format)</li>
              <li><strong className="text-zinc-200">Object</strong> to processing based on legitimate interest</li>
              <li><strong className="text-zinc-200">Restrict processing</strong> in certain circumstances</li>
            </ul>
            <p className="text-zinc-400 leading-relaxed mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">privacy@songswipe.io</a>.
              We will respond within 30 days.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-3">
              If you are unsatisfied with our response, you have the right to complain to the{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-400 underline">
                Information Commissioner&apos;s Office (ICO)
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
            <p className="text-zinc-400 leading-relaxed mb-3">We use a minimal number of cookies, all of which are strictly necessary to operate the service:</p>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-200">Authentication cookie:</strong> A session token set by Supabase to keep you signed in. Without this, you cannot use your account. This is a strictly necessary cookie and does not require consent under PECR.</p>
              <p><strong className="text-zinc-200">Stripe cookies:</strong> Set during checkout to process your payment securely. Strictly necessary for the payment to work.</p>
            </div>
            <p className="text-zinc-400 leading-relaxed mt-3">
              We do not use any analytics, advertising, or tracking cookies. If this changes in the future, we will update this policy and implement a full cookie consent mechanism.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children</h2>
            <p className="text-zinc-400 leading-relaxed">
              SongSwipe is not intended for use by anyone under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p className="text-zinc-400 leading-relaxed">
              We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by email or by placing a notice on our website. The &quot;last updated&quot; date at the top of this page shows when the policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
            <p className="text-zinc-400 leading-relaxed">
              For any questions about this Privacy Policy or to exercise your data rights, contact us at:{' '}
              <a href="mailto:privacy@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">privacy@songswipe.io</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-200 text-center">
          <Link href="/" className="text-brand-500 hover:text-brand-400 text-sm font-medium transition-colors">
            Back to SongSwipe
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
