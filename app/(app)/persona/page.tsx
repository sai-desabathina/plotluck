import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import PersonaForm from './PersonaForm'

export default async function PersonaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: persona } = await supabase.from('personas').select('*').eq('user_id', user!.id).single()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-gray-500 text-sm mb-8">
        This is your universal profile. You can always tweak budget, transport, or anything else per session — without changing this.
      </p>
      <Suspense>
        <PersonaForm persona={persona} />
      </Suspense>
    </div>
  )
}
