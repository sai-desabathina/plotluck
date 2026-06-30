'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'

const Logo = () => (
  <span className="font-black text-xl tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>
    outv<span className="text-amber-400">go</span>
  </span>
)

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'account' | 'name'>('account')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAccount(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setLoading(false); setStep('name') }
  }

  async function handleUsername(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/personas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        display_name: username,
        username: username.toLowerCase().replace(/\s+/g, '_'),
        cuisine_prefs: [],
        dietary_restrictions: [],
        allergies: [],
        budget_band: 2,
        transport_mode: 'any',
        has_kids: false,
        has_pets: false,
        activity_types: [],
      }),
    })
    setLoading(false)
    if (res.ok) router.push('/persona?setup=1')
    else { const d = await res.json(); setError(d.error ?? 'Failed to save') }
  }

  const inputCls = "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
  const labelCls = "block text-xs font-medium text-zinc-400 mb-1.5 font-mono uppercase tracking-wide"

  if (step === 'name') {
    return (
      <div className="min-h-screen bg-[#0C0C0C] text-zinc-100 flex flex-col">
        <nav className="flex items-center px-8 py-5 border-b border-zinc-900">
          <Link href="/"><Logo /></Link>
        </nav>
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            <div className="text-4xl mb-5">👋</div>
            <h1 className="font-black text-2xl mb-1" style={{ fontFamily: 'Satoshi, sans-serif' }}>
              What should we call you?
            </h1>
            <p className="text-zinc-500 text-sm mb-8 font-mono">how others will see you in sessions</p>
            <form onSubmit={handleUsername} className="space-y-4">
              <input
                type="text" required value={username} onChange={e => setUsername(e.target.value)}
                placeholder="e.g. Alex or Alex K."
                maxLength={30}
                className={inputCls}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit" disabled={loading || !username.trim()}
                className="w-full bg-amber-500 text-black py-3 rounded-lg font-semibold hover:bg-amber-400 disabled:opacity-40 transition-colors"
              >
                {loading ? 'Saving…' : 'Continue →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-zinc-100 flex flex-col">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-900">
        <Link href="/"><Logo /></Link>
        <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors font-mono">
          Sign in →
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-black text-2xl mb-1" style={{ fontFamily: 'Satoshi, sans-serif' }}>
            Create your account
          </h1>
          <p className="text-zinc-500 text-sm mb-8 font-mono">free to use · no credit card needed</p>

          <a
            href="/api/auth/login"
            className="flex items-center justify-center gap-2.5 w-full bg-amber-500 text-black font-semibold py-3 rounded-lg hover:bg-amber-400 transition-all duration-150 mb-6 shadow-lg shadow-amber-500/20"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#111" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#111" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#111" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#111" />
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[11px] text-zinc-600 font-mono">or email</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleAccount} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <input
                type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="at least 6 characters"
                className={inputCls}
              />
            </div>
            {error && (
              <p className="text-sm text-red-400 font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full bg-zinc-800 text-zinc-100 py-3 rounded-lg font-semibold hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-6 font-mono">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
