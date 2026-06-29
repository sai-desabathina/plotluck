import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditSessionForm from './EditSessionForm'

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: member } = await supabase
    .from('session_members')
    .select('role')
    .eq('session_id', id)
    .eq('user_id', user!.id)
    .single()

  if (member?.role !== 'organizer') redirect(`/sessions/${id}`)

  const { data: session } = await supabase.from('sessions').select('*').eq('id', id).single()
  if (!session) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit session</h1>
      <EditSessionForm session={session} />
    </div>
  )
}
