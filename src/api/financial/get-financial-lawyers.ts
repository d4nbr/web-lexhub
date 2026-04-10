export interface FinancialLawyerItem {
  inscricao: string
  sit_fin_atual: string
  data_nascimento: string | null
  sexo: string
  anos_contribuicao_calculado: number
  pcd: string
  nacionalidade: string
  subsecao: string
  mun_res: string
  uf_res: string
  suplementar: string
}

export interface FinancialLawyersResponse {
  page: number
  page_size: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
  items: FinancialLawyerItem[]
}

export interface FinancialLawyersFilters {
  page?: number
  page_size?: number
  inscricao?: string
  sit_fin_atual?: string
  sexo?: string
  pcd?: string
  uf_res?: string
  subsecao?: string | string[]
  suplementar?: string
}

const DEFAULT_FINANCIAL_API_URL =
  'https://n8n.iaoptimus.online/webhook/oab/financeiro/advogados'

export async function getFinancialLawyers(filters: FinancialLawyersFilters) {
  const baseUrl =
    process.env.NEXT_PUBLIC_FINANCIAL_API_URL || DEFAULT_FINANCIAL_API_URL

  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (Array.isArray(value)) {
      value
        .map(item => String(item).trim())
        .filter(Boolean)
        .forEach(item => params.append(key, item))
      return
    }

    const asString = String(value).trim()
    if (!asString) return
    params.set(key, asString)
  })

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Falha ao consultar dados financeiros')
  }

  return (await response.json()) as FinancialLawyersResponse
}
