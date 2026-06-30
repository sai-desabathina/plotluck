'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const personas = [
  { emoji: '👩‍💼', name: 'Priya',  lines: ['nut allergy', '$25', 'transit'] },
  { emoji: '🧔',   name: 'Marcus', lines: ['gluten-free', '$30', 'drives'] },
  { emoji: '👧',   name: 'Zoe',    lines: ['vegan', '$20', 'bus'] },
  { emoji: '👴',   name: 'Frank',  lines: ['shellfish allergy', '$35', 'drives'] },
  { emoji: '🧑‍🎤', name: 'Sam',    lines: ['loves spicy', '$22', 'transit'] },
  { emoji: '👩‍🍳', name: 'Nina',   lines: ['lactose-free', '$28', 'drives'] },
]

const RADIUS = 115
const CX = 200
const CY = 145

function circlePos(i: number, total: number) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
}

function PersonaAnimation() {
  const [step, setStep] = useState<'personas' | 'thinking' | 'result'>('personas')
  const [visible, setVisible] = useState<number[]>([])
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    setVisible([])
    setStep('personas')
    personas.forEach((_, i) => {
      timers.push(setTimeout(() => setVisible(v => [...v, i]), i * 420))
    })
    const base = personas.length * 420 + 700
    timers.push(setTimeout(() => setStep('thinking'), base))
    timers.push(setTimeout(() => setStep('result'), base + 1600))
    timers.push(setTimeout(() => setCycle(c => c + 1), base + 4200))
    return () => timers.forEach(clearTimeout)
  }, [cycle])

  return (
    <div className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ height: 290 }}>
      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 290" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 24} x2="400" y2={i * 24} stroke="#27272a" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 18 }, (_, i) => (
          <line key={`v${i}`} x1={i * 24} y1="0" x2={i * 24} y2="290" stroke="#27272a" strokeWidth="0.5" />
        ))}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        {step === 'result' ? (
          <div className="animate-fade-in flex flex-col items-center">
            <div className="bg-amber-500 text-black rounded-xl px-6 py-4 text-center shadow-2xl shadow-amber-500/25">
              <div className="font-mono text-[10px] font-medium uppercase tracking-widest opacity-60 mb-1.5">
                ✓ outvgo picked
              </div>
              <div className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>
                Nobu Thai Kitchen
              </div>
              <div className="text-sm opacity-80 mt-1 font-mono">
                gluten-free · vegan · $24 avg · 1.2 mi
              </div>
              <div className="text-xs opacity-60 mt-1 font-mono">
                transit accessible · all 6 matched
              </div>
            </div>
          </div>
        ) : step === 'thinking' ? (
          <div className="flex flex-col items-center gap-3 bg-zinc-900/90 backdrop-blur-sm rounded-xl px-6 py-4 border border-zinc-800">
            <div className="text-3xl animate-spin-slow">🤖</div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 font-mono">checking all profiles…</p>
          </div>
        ) : (
          <div className="relative" style={{ width: CX * 2, height: CY * 2 }}>
            <svg className="absolute inset-0" style={{ width: CX * 2, height: CY * 2 }}>
              {personas.map((_, i) => {
                const pos = circlePos(i, personas.length)
                return (
                  <line
                    key={i}
                    x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                    stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 3"
                    opacity={visible.includes(i) ? 0.45 : 0}
                    style={{ transition: 'opacity 0.4s ease' }}
                  />
                )
              })}
            </svg>

            {/* Center robot */}
            <div
              className="absolute rounded-full border border-amber-500/40 bg-zinc-900 shadow-lg shadow-amber-500/10 flex items-center justify-center text-xl"
              style={{ width: 44, height: 44, left: CX - 22, top: CY - 22 }}
            >
              🤖
            </div>

            {personas.map((p, i) => {
              const pos = circlePos(i, personas.length)
              const show = visible.includes(i)
              const onLeft = pos.x < CX - 20
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center gap-0.5"
                  style={{
                    left: pos.x - 18,
                    top: pos.y - 18,
                    opacity: show ? 1 : 0,
                    transform: show ? 'scale(1)' : 'scale(0.6)',
                    transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <div
                    className={`absolute bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1.5 shadow-xl text-left whitespace-nowrap z-10 ${onLeft ? 'right-9' : 'left-9'}`}
                    style={{ top: -6 }}
                  >
                    {p.lines.map((l, j) => (
                      <div key={j} className="text-[11px] text-zinc-400 leading-[1.4rem] font-mono">{l}</div>
                    ))}
                  </div>
                  <div className="text-2xl drop-shadow-sm">{p.emoji}</div>
                  <div className="text-[10px] font-semibold text-zinc-300 bg-zinc-900/80 rounded px-1 font-mono">
                    {p.name}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const useCases = [
  {
    num: '01',
    icon: '👥',
    title: 'Friends night out',
    desc: 'Set your profile once — allergies, budget, how you\'re getting there. Outvgo reads everyone\'s and finds the one place that works.',
  },
  {
    num: '02',
    icon: '💑',
    title: 'Date night, sorted',
    desc: "Both of you fill your profiles. Outvgo finds a place you'll both genuinely enjoy — no more 'I don't mind, you pick.'",
  },
  {
    num: '03',
    icon: '👨‍👩‍👧',
    title: 'The whole family',
    desc: 'Kids, parents, maybe a dog. Kids menus, outdoor seating, parking — figured out in seconds.',
  },
]

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-[#0C0C0C] text-zinc-100">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="font-black text-2xl tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif' }}>
          outv<span className="text-amber-400">go</span>
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors px-4 py-2 rounded-lg hover:bg-zinc-900"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-amber-500 text-black px-4 py-2 rounded-lg hover:bg-amber-400 transition-all duration-150"
          >
            Get started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-4 pb-24">
        <div className="max-w-3xl w-full">

          {/* Demo animation */}
          <div className="mb-10 rounded-2xl overflow-hidden border border-zinc-800">
            <PersonaAnimation />
          </div>

          {/* Headline */}
          <div className="text-center">
            <h1
              className="font-black text-5xl md:text-7xl tracking-tight mb-6 leading-[1.05]"
              style={{ fontFamily: 'Satoshi, sans-serif' }}
            >
              Stop chatting.<br />
              <span className="text-amber-400">Start going out.</span>
            </h1>

            <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Everyone fills their profile once — allergies, budget, how they&apos;re getting there.
              Outvgo reads all of them and finds the one place that works for everyone.
            </p>

            <a
              href="/api/auth/login"
              className="inline-flex items-center gap-3 bg-amber-500 text-black px-8 py-4 rounded-lg text-base font-semibold hover:bg-amber-400 transition-all duration-150 shadow-xl shadow-amber-500/20"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#111" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#111" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#111" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#111" />
              </svg>
              Continue with Google
            </a>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-4">
          {useCases.map(uc => (
            <div
              key={uc.num}
              className="bg-[#141414] border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 hover:border-zinc-700 transition-colors duration-150"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{uc.icon}</span>
                <span className="font-mono text-xs text-zinc-700 select-none">{uc.num}</span>
              </div>
              <div>
                <div className="font-semibold text-zinc-100 text-sm mb-2">{uc.title}</div>
                <p className="text-sm text-zinc-500 leading-relaxed">{uc.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-zinc-900">
        <span className="font-mono text-xs text-zinc-700">© 2026 outvgo</span>
      </footer>
    </main>
  )
}
