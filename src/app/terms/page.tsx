import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'SongSwipe Terms of Service - the rules and conditions for using our AI song creation service.',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-surface-DEFAULT">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-heading font-bold mb-2 text-white">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-500 mb-8">Last updated: February 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. About These Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              These terms govern your use of SongSwipe (&quot;the Service&quot;), an AI-powered personalised song creation platform. By creating an account or placing an order, you agree to these terms. Please read them carefully.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-3">
              These terms are governed by the laws of England and Wales. If you are a consumer, you also benefit from any mandatory consumer protection provisions in the country where you live.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. The Service</h2>
            <p className="text-zinc-400 leading-relaxed">
              SongSwipe allows you to create personalised, AI-generated songs for special occasions. You provide personal details (recipient name, occasion, memories) and our AI generates unique songs based on your inputs. Each order produces 3 song variants for you to choose from.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility</h2>
            <p className="text-zinc-400 leading-relaxed">
              You must be at least 16 years old to use SongSwipe. By creating an account, you confirm that you meet this age requirement. Each person may only create one account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Your Account</h2>
            <p className="text-zinc-400 leading-relaxed">
              You are responsible for keeping your login credentials secure. You must not share your account with others. If you believe someone has accessed your account without authorisation, contact us immediately at{' '}
              <a href="mailto:support@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">support@songswipe.io</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Orders and Payment</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>All prices are displayed in GBP (British Pounds) and include VAT where applicable.</p>
              <p>Payments are processed securely by Stripe. We do not store your card details.</p>
              <p>When you purchase a song bundle (3 or 5 songs), the prepaid songs can be used for any occasion. Bundles are non-refundable but transferable between occasions.</p>
              <p>Your order is confirmed once payment is successfully processed. Song generation begins immediately after payment.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Digital Content and Your Right to Cancel</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>Under the Consumer Rights Act 2015 and the Consumer Contracts Regulations 2013, you normally have a 14-day cooling-off period for online purchases.</p>
              <p>However, because SongSwipe delivers digital content (AI-generated songs), and generation begins immediately upon payment, you acknowledge and agree that:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You consent to the digital content being provided before the 14-day cancellation period expires</li>
                <li>You acknowledge that once song generation begins, you lose your right to cancel under the Consumer Contracts Regulations 2013</li>
              </ul>
              <p>This does not affect your statutory rights if the digital content is faulty or not as described.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Refund Policy</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p><strong className="text-zinc-200">Generation failure:</strong> If all 3 song variants fail to generate due to a technical error on our side, you will receive a full refund.</p>
              <p><strong className="text-zinc-200">Quality dissatisfaction:</strong> Because songs are subjective creative works and digital content is delivered immediately, we cannot offer refunds based on personal taste or quality preferences.</p>
              <p><strong className="text-zinc-200">Faulty content:</strong> If your song is materially different from what was described (e.g. completely wrong genre, missing personalisation), contact us and we will investigate. You have statutory rights under the Consumer Rights Act 2015 for digital content that is not of satisfactory quality, fit for purpose, or as described.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Song Ownership and Licence</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>When you purchase a song, you receive a <strong className="text-zinc-200">personal, non-exclusive, non-transferable licence</strong> to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Listen to, download, and share the song for personal, non-commercial purposes</li>
                <li>Share the song as a gift to the intended recipient</li>
                <li>Play the song at private gatherings</li>
              </ul>
              <p>You may <strong className="text-zinc-200">not</strong>:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Sell, sublicense, or commercially distribute the song</li>
                <li>Claim copyright ownership of the song</li>
                <li>Use the song in commercial products, advertisements, or broadcasts</li>
                <li>Upload the song to music streaming platforms (Spotify, Apple Music, etc.) for commercial distribution</li>
              </ul>
              <p>SongSwipe retains all intellectual property rights in the underlying AI models, technology, and generated content.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. AI-Generated Content</h2>
            <p className="text-zinc-400 leading-relaxed">All songs are generated by artificial intelligence. While we strive for high quality, please be aware that:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2 mt-3">
              <li>Each song is unique, but we cannot guarantee absolute uniqueness of melodies or lyrics across all songs ever generated</li>
              <li>AI-generated content may occasionally produce unexpected or imperfect results</li>
              <li>Songs are intended for personal gifting, not professional or commercial music production</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Acceptable Use</h2>
            <p className="text-zinc-400 leading-relaxed mb-3">When using SongSwipe, you agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400 ml-2">
              <li>Submit content that is offensive, hateful, threatening, or harassing</li>
              <li>Attempt to generate songs that promote violence, discrimination, or illegal activity</li>
              <li>Use the service to impersonate others or create misleading content</li>
              <li>Attempt to reverse-engineer, scrape, or misuse our AI technology</li>
              <li>Use automated systems to access the service (bots, scrapers)</li>
            </ul>
            <p className="text-zinc-400 leading-relaxed mt-3">
              We reserve the right to refuse song generation and suspend accounts that violate these rules, without refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Limitation of Liability</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>Nothing in these terms excludes or limits our liability for:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Death or personal injury caused by our negligence</li>
                <li>Fraud or fraudulent misrepresentation</li>
                <li>Any liability that cannot be excluded by law</li>
              </ul>
              <p>Subject to the above, our total liability to you for any claim arising from or related to the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.</p>
              <p>We are not liable for any indirect, consequential, or incidental losses, including loss of profit, data, or opportunity.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Account Suspension and Termination</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>We may suspend or terminate your account if you breach these terms, particularly the acceptable use policy.</p>
              <p>You may request deletion of your account at any time by contacting{' '}
                <a href="mailto:support@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">support@songswipe.io</a>.
                See our <Link href="/privacy" className="text-brand-500 hover:text-brand-400 underline">Privacy Policy</Link> for details on data retention after account deletion.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Dispute Resolution</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>If you have a complaint, please contact us first at{' '}
                <a href="mailto:support@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">support@songswipe.io</a>.
                We will do our best to resolve any issues directly.
              </p>
              <p>If we cannot resolve your complaint, you may refer the matter to the courts of England and Wales. If you live in Scotland, you can bring proceedings in Scottish courts. If you live in Northern Ireland, you can bring proceedings in Northern Irish courts.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Changes to These Terms</h2>
            <p className="text-zinc-400 leading-relaxed">
              We may update these terms from time to time. If we make material changes, we will notify you by email or by placing a prominent notice on our website. Your continued use of the Service after changes take effect constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">15. Contact Us</h2>
            <p className="text-zinc-400 leading-relaxed">
              For any questions about these Terms of Service, contact us at:{' '}
              <a href="mailto:support@songswipe.io" className="text-brand-500 hover:text-brand-400 underline">support@songswipe.io</a>
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
