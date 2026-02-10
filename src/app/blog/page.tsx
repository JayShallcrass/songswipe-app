import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - SongSwipe | Personalised Song Ideas & Gift Guides',
  description: 'Discover unique gift ideas, personalised song inspiration, and guides for creating the perfect musical gift for birthdays, Valentine\'s, anniversaries, and special occasions.',
  keywords: ['personalised song blog', 'gift ideas', 'birthday songs', 'Valentine\'s gifts', 'anniversary gifts', 'AI music gifts'],
  openGraph: {
    title: 'SongSwipe Blog - Personalised Song Ideas',
    description: 'Discover unique gift ideas and guides for creating the perfect musical gift.',
    type: 'website',
  },
}

export default function BlogPage() {
  const blogPosts = [
    {
      slug: 'unique-birthday-song-ideas',
      title: '10 Unique Birthday Song Ideas for 2025',
      excerpt: 'Looking for a truly memorable birthday gift? Discover how AI-generated songs are revolutionising birthday celebrations with personalised lyrics and professional quality.',
      category: 'Gift Ideas',
      date: '2025-01-15',
      readTime: '5 min read',
    },
    {
      slug: 'valentines-day-song-guide',
      title: 'The Ultimate Valentine\'s Day Song Guide',
      excerpt: 'Stand out this Valentine\'s Day with a personalised song that truly captures your feelings. Learn what makes a great romantic song gift.',
      category: 'Occasions',
      date: '2025-01-10',
      readTime: '7 min read',
    },
    {
      slug: 'ai-music-faq',
      title: 'Everything You Need to Know About AI-Generated Music',
      excerpt: 'How does AI music generation work? Is the quality comparable to human musicians? We answer your burning questions about AI songs.',
      category: 'Technology',
      date: '2025-01-05',
      readTime: '6 min read',
    },
    {
      slug: 'wedding-anniversary-songs',
      title: '5 Songs for Your Wedding Anniversary',
      excerpt: 'Traditional anniversary gifts are fine, but a personalised song creates memories that last forever. Here are our top recommendations.',
      category: 'Occasions',
      date: '2024-12-28',
      readTime: '4 min read',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              SongSwipe
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium"
            >
              Create a Song
            </Link>
          </nav>
        </div>
      </header>

      {/* Blog Header */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          SongSwipe Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover unique gift ideas, personalised song inspiration, and guides for creating the perfect musical gift.
        </p>
      </section>

      {/* Blog Posts */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8">
            {blogPosts.map((post) => (
              <article 
                key={post.slug}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    <span className="text-gray-400 text-sm">{post.date}</span>
                    <span className="text-gray-400 text-sm">{post.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-800 transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Get Song Ideas Delivered
            </h2>
            <p className="text-purple-100 mb-6 max-w-xl mx-auto">
              Subscribe to our newsletter for exclusive gift ideas, songwriting tips, and special offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm">&copy; 2025-2026 SongSwipe. AI-generated personalised songs.</p>
        </div>
      </footer>
    </div>
  )
}
