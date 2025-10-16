import { RateLimiter } from 'rate-limiter-flexible'
import validator from 'validator'

// Rate limiting
export const rateLimiter = new RateLimiter({
  keyGenerator: (req) => req.ip ?? 'anonymous',
  points: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW) || 900, // 15 minutes
})

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  
  return validator.escape(
    validator.stripLow(input)
  ).trim()
}

// XSS Protection
export function sanitizeHTML(html) {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

// API Key validation
export function isValidApiKey(key) {
  return typeof key === 'string' && 
         key.length > 20 && 
         !key.includes(' ') &&
         validator.isAlphanumeric(key.replace(/[^a-zA-Z0-9]/g, ''))
}
