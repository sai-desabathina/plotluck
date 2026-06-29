import { createClient } from '@/lib/supabase/server'
import PersonaForm from './PersonaForm'

export default async function PersonaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: persona } = await supabase.from('personas').select('*').eq('user_id', user!.id).single()

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Persona</h1>
      <p className="text-gray-500 mb-6">Your food preferences, reused across all sessions.</p>
      <PersonaForm persona={persona} />
    </div>
  )
}
