import { z } from 'zod'

// Defina o esquema de validação com Zod
export const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(), // Valida se é uma URL válida
})

let env: { NEXT_PUBLIC_API_URL: string }

// Verifique se estamos no servidor ou no frontend
if (typeof window === 'undefined') {
  // No servidor, valida usando process.env diretamente
  env = envSchema.parse(process.env) // Validação no servidor
} else {
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  if (!API_URL) {
    console.error('API URL não está definida no frontend.')
  }

  env = { NEXT_PUBLIC_API_URL: API_URL || '' }
}

export { env }
