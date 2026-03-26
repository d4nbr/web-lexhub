import { NextResponse } from 'next/server'

const N8N_UPLOAD_WEBHOOK_URL =
  'https://n8n.iaoptimus.online/webhook/armazena-baseoab'

export async function POST(request: Request) {
  try {
    const incomingFormData = await request.formData()
    const file = incomingFormData.get('data')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: 'Arquivo não recebido no campo "data".' },
        { status: 400 }
      )
    }

    const outboundFormData = new FormData()
    outboundFormData.append('data', file, file.name)

    const n8nResponse = await fetch(N8N_UPLOAD_WEBHOOK_URL, {
      method: 'POST',
      body: outboundFormData,
    })

    if (!n8nResponse.ok) {
      const responseText = await n8nResponse.text()
      return NextResponse.json(
        {
          message: 'Falha ao enviar arquivo para o fluxo n8n.',
          details: responseText || `HTTP ${n8nResponse.status}`,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({ message: 'Arquivo enviado com sucesso.' })
  } catch (error) {
    console.error('Erro ao encaminhar upload da base para o n8n:', error)
    return NextResponse.json(
      { message: 'Erro interno ao processar upload da base.' },
      { status: 500 }
    )
  }
}
