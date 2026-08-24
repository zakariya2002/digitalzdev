import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { TaxRegime } from '../lib/tax'

export interface CompanySettings {
  active_regime_id: string | null
  legal_name: string | null
  trade_name: string | null
  siret: string | null
  vat_number: string | null
  address: string | null
  email: string | null
  phone: string | null
  iban: string | null
  bic: string | null
  bank_name: string | null
  account_holder: string | null
  payment_reference_note: string | null
  eur_to_dzd: number | null
}

/** Barèmes fiscaux et identité de l'entreprise, tenus en base et non dans le code. */
export function useTaxRegimes() {
  const [regimes, setRegimes] = useState<TaxRegime[]>([])
  const [settings, setSettings] = useState<CompanySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    const [{ data: r, error: re }, { data: s }] = await Promise.all([
      supabase.from('tax_regimes').select('*').eq('is_active', true).order('position'),
      supabase.from('company_settings').select('*').maybeSingle(),
    ])
    if (re) setError('Impossible de charger les barèmes fiscaux.')
    setRegimes((r || []) as unknown as TaxRegime[])
    setSettings((s || null) as unknown as CompanySettings | null)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const activeRegime = regimes.find(r => r.id === settings?.active_regime_id) || regimes[0] || null

  return { regimes, settings, activeRegime, loading, error, refresh: fetchAll }
}
