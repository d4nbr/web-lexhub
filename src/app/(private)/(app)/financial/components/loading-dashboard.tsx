'use client'

import { useEffect, useMemo, useState } from 'react'

const MESSAGES = [
  'Gerando dashboard...',
  'Processando dados filtrados...',
  'Finalizando análise...',
]

export function LoadingDashboard() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(12)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setMessageIndex(prev => (prev + 1) % MESSAGES.length)
        setVisible(true)
      }, 220)
    }, 1800)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 92) return prev
        const next = prev + Math.random() * 6
        return Math.min(92, Number(next.toFixed(1)))
      })
    }, 520)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const message = useMemo(() => MESSAGES[messageIndex], [messageIndex])

  return (
    <div className="rounded-lg border border-slate-700/90 bg-slate-900/70 p-5 text-slate-200">
      <div className="animate-[fadeIn_260ms_ease-out]">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12">
            <svg className="h-12 w-12 -rotate-90" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="21" stroke="#1e293b" strokeWidth="4" />
              <circle
                cx="26"
                cy="26"
                r="21"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="48 132"
                className="animate-[ringDash_1.35s_ease-in-out_infinite]"
              />
            </svg>
            <span className="pointer-events-none absolute inset-0 rounded-full bg-sky-500/20 blur-[8px] animate-pulse" />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex h-8 items-end gap-1.5">
              {[0, 1, 2, 3, 4].map(i => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-cyan-400/90"
                  style={{
                    height: '100%',
                    animation: `waveBars 0.95s ease-in-out ${i * 0.12}s infinite`,
                  }}
                />
              ))}
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <p
          className={`mt-4 text-sm text-slate-300 transition-opacity duration-200 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {message}
        </p>
      </div>

      <style jsx>{`
        @keyframes ringDash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -180;
          }
        }

        @keyframes waveBars {
          0%,
          100% {
            transform: scaleY(0.3);
            opacity: 0.45;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
