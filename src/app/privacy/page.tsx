import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'SongSwipe Privacy Policy - how we collect, use, and protect your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who We Are</h2>
            <p className="text-gray-600 leading-relaxed">
              SongSwipe (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a personalised AI song creation service. We are the data controller responsible for your personal data. If you have any questions about this policy or your data, contact us at{' '}
              <a href="mailto:privacy@songswipe.io" className="text-purple-600 hover:text-purple-700 underline">privacy@songswipe.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. What Data We Collect</h2>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">Account data:</strong> Your name and email address when you sign up (via email/password or Google OAuth).</p>
              <p><strong className="text-gray-800">Song personalisation data:</strong> Recipient names, special memories, occasion details, and any other information you provide to personalise your song.</p>
              <p><strong className="text-gray-800">Payment data:</strong> Payment transactions are processed by Stripe. We do not store your card number, expiry date, or CVV. We receive a transaction reference and payment status from Stripe.</p>
              <p><strong className="text-gray-800">Song audio files:</strong> The AI-generated songs created for you, stored securely so you can access and download them.</p>
              <p><strong className="text-gray-800">Technical data:</strong> Your browser type, IP address, and how you interact with our site (e.g. pages visited). This is collected automatically by our hosting provider.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Why We Collect It</h2>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">To deliver our service:</strong> We need your personalisation details to generate your song, your email to create your account, and payment information to process your order.</p>
              <p><strong className="text-gray-800">To improve our service:</strong> We may analyse usage patterns (in aggregate, not individually) to make SongSwipe better.</p>
              <p><strong className="text-gray-800">To communicate with you:</strong> Order confirmations, gift delivery notifications, and essential service updates.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Legal Basis for Processing</h2>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">Contract performance:</strong> Processing your data is necessary to fulfil your song order and deliver the service you paid for.</p>
              <p><strong className="text-gray-800">Legitimate interest:</strong> Improving our service, preventing fraud, and ensuring security.</p>
              <p><strong className="text-gray-800">Consent:</strong> If we introduce marketing emails in the future, we will ask for your explicit consent first.</p>
              <p><strong className="text-gray-800">Legal obligation:</strong> We retain payment records for 6 years as required by HMRC.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Who We Share Data With</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We share your data only with the service providers necessary to run SongSwipe:</p>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Provider</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 text-gray-800">Supabase</td>
                    <td className="px-4 py-3 text-gray-600">Database, authentication</td>
                    <td className="px-4 py-3 text-gray-600">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-800">Stripe</td>
                    <td className="px-4 py-3 text-gray-600">Payment processing</td>
                    <td className="px-4 py-3 text-gray-600">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-800">ElevenLabs</td>
                    <td className="px-4 py-3 text-gray-600">AI song generation</td>
                    <td className="px-4 py-3 text-gray-600">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-800">Vercel</td>
                    <td className="px-4 py-3 text-gray-600">Website hosting</td>
                    <td className="px-4 py-3 text-gray-600">US (EU SCCs)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-800">Resend</td>
                    <td className="px-4 py-3 text-gray-600">Transactional emails</td>
                    <td className="px-4 py-3 text-gray-600">US (EU SCCs)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-600 leading-relaxed mt-3">
              Where data is transferred outside the UK/EEA, we ensure appropriate safeguards are in place (Standard Contractual Clauses). We do not sell your data to anyone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. How Long We Keep Your Data</h2>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">Account data:</strong> Kept until you request deletion of your account.</p>
              <p><strong className="text-gray-800">Song audio files:</strong> Kept for 12 months after creation, then automatically deleted.</p>
              <p><strong className="text-gray-800">Song personalisation data:</strong> Kept for 12 months after creation alongside the song.</p>
              <p><strong className="text-gray-800">Payment records:</strong> Kept for 6 years as required by HMRC for tax purposes.</p>
              <p><strong className="text-gray-800">Technical logs:</strong> Kept for up to 30 days by our hosting provider.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Under UK GDPR, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li><strong className="text-gray-800">Access</strong> your personal data (request a copy of what we hold)</li>
              <li><strong className="text-gray-800">Rectification</strong> of inaccurate data</li>
              <li><strong className="text-gray-800">Erasure</strong> of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong className="text-gray-800">Data portability</strong> (receive your data in a machine-readable format)</li>
              <li><strong className="text-gray-800">Object</strong> to processing based on legitimate interest</li>
              <li><strong className="text-gray-800">Restrict processing</strong> in certain circumstances</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@songswipe.io" className="text-purple-600 hover:text-purple-700 underline">privacy@songswipe.io</a>.
              We will respond within 30 days.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              If you are unsatisfied with our response, you have the right to complain to the{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">
                Information Commissioner&apos;s Office (ICO)
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use a minimal number of cookies, all of which are strictly necessary to operate the service:</p>
            <div className="space-y-3 text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">Authentication cookie:</strong> A session token set by Supabase to keep you signed in. Without this, you cannot use your account. This is a strictly necessary cookie and does not require consent under PECR.</p>
              <p><strong className="text-gray-800">Stripe cookies:</strong> Set during checkout to process your payment securely. Strictly necessary for the payment to work.</p>
            </div>
            <p className="text-gray-600 leading-relaxed mt-3">
              We do not use any analytics, advertising, or tracking cookies. If this changes in the future, we will update this policy and implement a full cookie consent mechanism.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children</h2>
            <p className="text-gray-600 leading-relaxed">
              SongSwipe is not intended for use by anyone under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. If we make significant changes, we will notify you by email or by placing a notice on our website. The &quot;last updated&quot; date at the top of this page shows when the policy was last revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For any questions about this Privacy Policy or to exercise your data rights, contact us at:{' '}
              <a href="mailto:privacy@songswipe.io" className="text-purple-600 hover:text-purple-700 underline">privacy@songswipe.io</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <Link href="/" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Back to SongSwipe
          </Link>
        </div>
      </div>
    </div>
  )
}
