import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-orange-500 text-lg">
          🍽️ Plotluck
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/persona" className="text-sm text-gray-600 hover:text-gray-900">My Persona</Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
