'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const personas = [
  { emoji: '👩‍💼', name: 'Priya',  lines: ['🥜 Nut allergy', '💰 Budget $25', '🚇 Public transport'] },
  { emoji: '🧔',   name: 'Marcus', lines: ['🌾 Gluten-free', '💰 Budget $30', '🚗 Will drive'] },
  { emoji: '👧',   name: 'Zoe',    lines: ['🌱 Vegan', '💰 Budget $20', '🚌 Bus only'] },
  { emoji: '👴',   name: 'Frank',  lines: ['🦪 Shellfish allergy', '💰 Budget $35', '🚗 Will drive'] },
  { emoji: '🧑‍🎤', name: 'Sam',    lines: ['🌶️ Loves spicy', '💰 Budget $22', '🚇 Public transport'] },
  { emoji: '👩‍🍳', name: 'Nina',   lines: ['🥛 Lactose-free', '💰 Budget $28', '🚗 Will drive'] },
]

const RADIUS = 115
const CX = 200
const CY = 145

function circlePos(i: number, total: number) {
  const angle = (i / total) * 2 * Math.PI - Math.PI / 2
  return { x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) }
}

// Restaurant pins on the map background
const mapPins = [
  { x: 60,  y: 40,  icon: '🍣', label: 'Japanese' },
  { x: 290, y: 30,  icon: '🍛', label: 'Indian' },
  { x: 350, y: 110, icon: '🥘', label: 'Thai' },
  { x: 30,  y: 180, icon: '🍕', label: 'Italian' },
  { x: 320, y: 220, icon: '🌮', label: 'Mexican' },
  { x: 160, y: 260, icon: '🍜', label: 'Ramen' },
  { x: 60,  y: 110, icon: '🥗', label: 'Salad' },
  { x: 240, y: 160, icon: '🍔', label: 'Burger' },
]

function MapBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 290" preserveAspectRatio="xMidYMid slice">
      {/* road grid */}
      <rect width="400" height="290" fill="#f1f5f9" />
      {/* horizontal roads */}
      {[60, 110, 160, 210, 260].map(y => (
        <rect key={y} x="0" y={y - 4} width="400" height="8" fill="#e2e8f0" rx="2" />
      ))}
      {/* vertical roads */}
      {[70, 140, 210, 290, 360].map(x => (
        <rect key={x} x={x - 4} y="0" width="8" height="290" fill="#e2e8f0" rx="2" />
      ))}
      {/* blocks */}
      {[
        [10,20,50,30], [90,20,40,30], [160,20,40,30], [230,20,50,30], [310,20,40,30],
        [10,75,50,25], [90,75,40,25], [160,75,40,25], [230,75,50,25], [310,75,40,25],
        [10,125,50,25],[90,125,40,25],[160,125,40,25],[230,125,50,25],[310,125,40,25],
        [10,175,50,25],[90,175,40,25],[160,175,40,25],[230,175,50,25],[310,175,40,25],
        [10,225,50,25],[90,225,40,25],[160,225,40,25],[230,225,50,25],[310,225,40,25],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="#cbd5e1" opacity="0.35" rx="3" />
      ))}
      {/* restaurant pins */}
      {mapPins.map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y})`}>
          <circle r="14" fill="white" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.9" />
          <text textAnchor="middle" dominantBaseline="central" fontSize="14">{p.icon}</text>
        </g>
      ))}
    </svg>
  )
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
    timers.push(setTimeout(() => setCycle(c => c + 1), base + 4000))
    return () => timers.forEach(clearTimeout)
  }, [cycle])

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: 290 }}>
      {/* map always visible behind */}
      <MapBackground />

      {/* overlay content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {step === 'result' ? (
          <div className="animate-fade-in flex flex-col items-center gap-2">
            <div className="bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-2xl px-6 py-4 text-center shadow-2xl">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-80 mb-1">✓ Outvgo picked</div>
              <div className="font-bold text-lg">Nobu Thai Kitchen</div>
              <div className="text-sm opacity-90 mt-1">Gluten-free · Vegan · $24 avg · 1.2 mi</div>
              <div className="text-xs opacity-75 mt-1">Reachable by transit · Matches all 6</div>
            </div>
          </div>
        ) : step === 'thinking' ? (
          <div className="flex flex-col items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4">
            <div className="text-3xl animate-spin-slow">🤖</div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium">Checking all profiles…</p>
          </div>
        ) : (
          <div className="relative" style={{ width: CX * 2, height: CY * 2 }}>
            {/* connecting lines from center to personas */}
            <svg className="absolute inset-0" style={{ width: CX * 2, height: CY * 2 }}>
              {personas.map((_, i) => {
                const pos = circlePos(i, personas.length)
                return (
                  <line
                    key={i}
                    x1={CX} y1={CY} x2={pos.x} y2={pos.y}
                    stroke="#f97316" strokeWidth="1" strokeDasharray="4 3" opacity={visible.includes(i) ? 0.4 : 0}
                    style={{ transition: 'opacity 0.4s' }}
                  />
                )
              })}
            </svg>

            {/* center robot */}
            <div className="absolute bg-white rounded-full border-2 border-orange-300 shadow-md flex items-center justify-center text-xl"
              style={{ width: 44, height: 44, left: CX - 22, top: CY - 22 }}>
              🤖
            </div>

            {personas.map((p, i) => {
              const pos = circlePos(i, personas.length)
              const show = visible.includes(i)
              const onLeft = pos.x < CX - 20
              return (
                <div
                  key={i}
                  className="absolute flex flex-col items-center gap-0.5 transition-all duration-400"
                  style={{ left: pos.x - 18, top: pos.y - 18, opacity: show ? 1 : 0, transform: show ? 'scale(1)' : 'scale(0.5)' }}
                >
                  {/* profile card */}
                  <div
                    className={`absolute bg-white border border-gray-200 rounded-lg px-2 py-1.5 shadow-lg text-left whitespace-nowrap z-10 ${onLeft ? 'right-9' : 'left-9'}`}
                    style={{ top: -6 }}
                  >
                    {p.lines.map((l, j) => (
                      <div key={j} className="text-xs text-gray-600 leading-[1.35rem]">{l}</div>
                    ))}
                  </div>
                  <div className="text-2xl drop-shadow-sm">{p.emoji}</div>
                  <div className="text-xs font-semibold text-gray-700 bg-white/80 rounded px-1">{p.name}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const tiles = [
  {
    icon: '👥',
    title: 'Going out with friends',
    desc: "Set your own profile — allergies, budget, how you're getting there. Outvgo reads everyone's and finds the one place that works for all.",
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: '💑',
    title: 'Date night, sorted',
    desc: "Both of you fill your profiles. Outvgo finds a place you'll both genuinely enjoy — no more \"I don't mind, you pick.\"",
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'The whole family',
    desc: "Kids, parents, maybe a dog. Everyone's needs — kids menus, outdoor seating, parking — figured out in seconds.",
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
]

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="text-2xl font-black tracking-tight text-gray-900">outv<span className="text-orange-500">go</span></span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors">
            Sign up free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-8 pb-20 text-center">
        <div className="max-w-3xl w-full">

          {/* Animation with map */}
          <div className="mb-10 rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
            <PersonaAnimation />
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
            Stop chatting.<br />
            <span className="text-orange-500">Start going out.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-3 max-w-xl mx-auto">
            Everyone fills their own profile once — allergies, budget, how they're getting there.
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Outvgo reads all of them and finds the one place that actually works for everyone.
          </p>

          {/* Tiles */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {tiles.map(tile => (
              <div
                key={tile.title}
                className={`${tile.bg} ${tile.border} border rounded-2xl p-6 text-left flex flex-col gap-3 hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tile.color} flex items-center justify-center text-2xl shadow-sm`}>
                  {tile.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-base">{tile.title}</div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{tile.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Get started free
          </Link>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-gray-400 text-sm border-t border-gray-100">
        © 2026 outvgo
      </footer>
    </main>
  )
}
