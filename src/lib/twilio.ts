import { supabase } from './supabase'

// Récupère un token Twilio Voice via l'Edge Function
export async function fetchTwilioToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Non authentifié')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/twilio-token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) throw new Error('Erreur génération token Twilio')
  const { token } = await response.json()
  return token
}

// Envoie un SMS via l'Edge Function
export async function sendSms(params: {
  clientId: string
  body?: string
  templateId?: string
}): Promise<{ messageSid: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Non authentifié')

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    }
  )

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Erreur envoi SMS')
  }
  return response.json()
}

// Parse un template SMS en remplaçant les variables
export function parseTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => variables[key] || `{{${key}}}`
  )
}
