/**
 * Upload de imagem para missão — Supabase Storage bucket 'mission-images'.
 * Aceita JPG, PNG, WebP até 5MB. Converte para WebP (máx 800px) via Canvas
 * antes do upload — arquivo já chega otimizado no Supabase CDN.
 */
'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  moduleId:  string
  value:     string        // URL atual (pode ser vazia)
  onChange:  (url: string) => void
}

const BUCKET       = 'mission-images'
const MAX_SIZE_MB  = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function MissionImageUpload({ moduleId, value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * Converte qualquer imagem para WebP (máx 800px largura) via Canvas API
   * antes de enviar ao Supabase — sem custo de otimização no Vercel.
   */
  function convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)

        // Redimensiona para no máximo 800px de largura (2× retina para tela mobile)
        const MAX_W = 800
        const scale = img.width > MAX_W ? MAX_W / img.width : 1
        const w     = Math.round(img.width  * scale)
        const h     = Math.round(img.height * scale)

        const canvas = document.createElement('canvas')
        canvas.width  = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas não suportado')); return }

        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Conversão falhou')),
          'image/webp',
          0.85,   // qualidade 85% — bom equilíbrio tamanho/qualidade
        )
      }

      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')) }
      img.src = url
    })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validações
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Converte para WebP + redimensiona no browser antes do upload
      const webpBlob = await convertToWebP(file)
      const path     = `missions/${moduleId}/${Date.now()}.webp`
      const supabase = createClient()

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, webpBlob, {
          contentType:  'image/webp',
          upsert:       false,
          cacheControl: '31536000',   // 1 ano de cache
        })

      if (uploadError) {
        setError('Erro ao fazer upload. Tente novamente.')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path)

      onChange(publicUrl)
    } catch {
      setError('Erro ao processar imagem. Tente novamente.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemove() {
    onChange('')
    setError(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">
        Imagem ilustrativa (opcional)
      </label>

      {/* Preview da imagem atual */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-36 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70
                       flex items-center justify-center transition-colors"
            aria-label="Remover imagem"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      )}

      {/* Campo de URL manual */}
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://... (ou faça upload abaixo)"
        className="input text-sm"
      />

      {/* Botão de upload */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed
                     border-gray-300 text-gray-500 text-sm hover:border-brand-blue
                     hover:text-brand-blue transition-colors disabled:opacity-50"
        >
          {uploading
            ? <><Loader2 size={15} className="animate-spin" /> Enviando...</>
            : <><Upload size={15} /> Fazer upload</>
          }
        </button>

        <span className="text-xs text-gray-400 flex items-center gap-1">
          <ImageIcon size={12} />
          JPG, PNG, WebP · máx 5MB
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {error && (
        <p className="text-red-500 text-xs">{error}</p>
      )}
    </div>
  )
}
