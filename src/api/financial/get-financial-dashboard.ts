export interface FinancialSeccionalDistributionItem {
  subsecao: string
  total: number
  percentual: number
}

export interface FinancialDashboardResponse {
  totalBase: number
  totalFiltrado: number
  universoSexo: number
  universoPcd: number
  universoTipo: number
  universoSeccional: number
  adimplentes: number
  inadimplentes: number
  masculino: number
  feminino: number
  pcdSim: number
  pcdNao: number
  suplementares: number
  originarias: number
  seccionalDistribuicao?: FinancialSeccionalDistributionItem[]
}

interface FinancialDashboardFilters {
  sit_fin_atual?: string
  sexo?: string
  pcd?: string
  subsecao?: string
  suplementar?: string
}

const DEFAULT_FINANCIAL_DASHBOARD_API_URL =
  'https://n8n.iaoptimus.online/webhook/oabma/financeiro/dashboard'

export async function getFinancialDashboard(filters: FinancialDashboardFilters) {
  const baseUrl =
    process.env.NEXT_PUBLIC_FINANCIAL_DASHBOARD_API_URL ||
    DEFAULT_FINANCIAL_DASHBOARD_API_URL

  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    const asString = String(value).trim()
    if (!asString) return
    params.set(key, asString)
  })

  const response = await fetch(`${baseUrl}?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Falha ao gerar dashboard financeiro')
  }

  return (await response.json()) as FinancialDashboardResponse
}
