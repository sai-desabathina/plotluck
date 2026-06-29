import Link from 'next/link'

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            🍽️ Group meals, made easy
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Stop debating.<br />
            <span className="text-orange-500">Start eating.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
            Plotluck asks everyone where they want to eat, checks schedules and dietary needs, then picks the perfect spot — automatically.
          </p>
          <Link
            href="/api/auth/login"
            className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            How Plotluck works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: '1',
                icon: '👤',
                title: 'Build your persona',
                desc: "Set your cuisine preferences, dietary restrictions, budget, and when you're free. Do it once — reuse it forever.",
              },
              {
                step: '2',
                icon: '📅',
                title: 'Create a session & invite',
                desc: 'Start a meal session, share a link. Everyone joins and drops their availability in seconds.',
              },
              {
                step: '3',
                icon: '🤖',
                title: 'AI finds the spot',
                desc: "Our AI reads everyone's preferences, checks real restaurants nearby, and proposes the top picks with a map.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl mb-4">
                  {icon}
                </div>
                <div className="text-sm font-semibold text-orange-500 mb-2">Step {step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-orange-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to end the debate?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Free to use. No credit card needed. Just bring your appetite.
          </p>
          <Link
            href="/api/auth/login"
            className="inline-flex items-center gap-3 bg-white text-orange-500 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-orange-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get started free
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-gray-400 text-sm">
        © 2026 Plotluck. Made with 🍜
      </footer>
    </main>
  )
}
