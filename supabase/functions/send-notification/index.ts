import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

serve(async (req) => {
  try {
    const { dilemme_id, voter_id, choix } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Récupérer le dilemme
    const { data: dilemme } = await supabase
      .from('dilemmes')
      .select('auteur, question, user_id, votes_a, votes_b')
      .eq('id', dilemme_id)
      .single()

    if (!dilemme || !dilemme.user_id) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }

    // Pas de notif si on vote sur son propre dilemme
    if (dilemme.user_id === voter_id) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }

    // Récupérer le push token du propriétaire du dilemme
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_token')
      .eq('id', dilemme.user_id)
      .single()

    if (!profile?.push_token) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 })
    }

    const total = dilemme.votes_a + dilemme.votes_b
    const pctA = total ? Math.round((dilemme.votes_a / total) * 100) : 50
    const pctB = 100 - pctA
    const perfScore = Math.abs(pctA - 50)

    // Déterminer le type de notification
    let title = '🗳️ Nouveau vote !'
    let body = `Quelqu'un a voté sur ton dilemme "${dilemme.question.substring(0, 50)}..."`

    if (total === 1) {
      title = '🎉 Premier vote !'
      body = `Ton dilemme reçoit son premier vote !`
    } else if (perfScore <= 2) {
      title = '🎯 Dilemme Parfait !'
      body = `Ton dilemme est à ${pctA}% vs ${pctB}% — c'est un Dilemme Parfait !`
    }

    // Envoyer la notification via Expo
    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: profile.push_token,
        title,
        body,
        sound: 'default',
        data: { dilemme_id },
      })
    })

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})