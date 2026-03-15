function toHex(array: Uint8Array) {
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function randomId(size = 20): string {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(size)
    window.crypto.getRandomValues(bytes)

    return toHex(bytes)
  }

  // Node.js
  const crypto = require('crypto')

  return crypto.randomBytes(size).toString('hex')
}
