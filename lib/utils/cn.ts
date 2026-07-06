/**
 * Utilitário para mesclar classes Tailwind sem conflitos.
 * Combina clsx (lógica condicional) + tailwind-merge (resolve conflitos).
 * Uso: cn('px-4 py-2', isActive && 'bg-blue-500', className)
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
