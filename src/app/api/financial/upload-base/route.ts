import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import SftpClient from 'ssh2-sftp-client'

export const runtime = 'nodejs'

const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls'])
const TEMP_DIR = '/tmp'

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`)
  }
  return value
}

export async function POST(request: Request) {
  let tempFilePath: string | null = null
  const sftp = new SftpClient()

  try {
    const incomingFormData = await request.formData()
    const file = incomingFormData.get('data')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: 'Arquivo não recebido no campo "data".' },
        { status: 400 }
      )
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { message: 'Formato inválido. Envie apenas arquivos .xlsx ou .xls.' },
        { status: 400 }
      )
    }

    const host = getRequiredEnv('FINAL_SFTP_HOST')
    const port = Number(process.env.FINAL_SFTP_PORT || '22')
    const username = getRequiredEnv('FINAL_SFTP_USER')
    const password = getRequiredEnv('FINAL_SFTP_PASSWORD')
    const remoteBasePath = getRequiredEnv('FINAL_SFTP_PATH')

    const safeOriginalName = path.basename(file.name).replace(/\s+/g, '_')
    const tempFileName = `${Date.now()}-${safeOriginalName}`
    tempFilePath = path.join(TEMP_DIR, tempFileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await fs.writeFile(tempFilePath, buffer)

    await sftp.connect({
      host,
      port,
      username,
      password,
      readyTimeout: 20000,
    })

    const remotePath = path.posix.join(remoteBasePath, safeOriginalName)
    await sftp.put(tempFilePath, remotePath)

    return NextResponse.json({
      message: 'Arquivo enviado com sucesso para o servidor final.',
      fileName: safeOriginalName,
      remotePath,
    })
  } catch (error) {
    console.error('Erro no upload e transferência da base:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido na transferência.'

    return NextResponse.json(
      {
        message: 'Não foi possível transferir o arquivo para o servidor final.',
        details: errorMessage,
      },
      { status: 500 }
    )
  } finally {
    try {
      await sftp.end()
    } catch {
      // noop
    }

    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath)
      } catch {
        // noop
      }
    }
  }
}
