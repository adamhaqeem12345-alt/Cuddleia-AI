import { AI_PROVIDERS } from './ai-providers.js'
import { rateLimiter, sanitizeInput, sanitizeHTML } from './security.js'

export class AIOrchestrator {
  constructor(userId) {
    this.userId = userId
    this.attempts = 0
    this.maxAttempts = AI_PROVIDERS.length
  }

  async generateWebsite(requirements, projectType = 'fullstack') {
    // Rate limiting per user
    try {
      await rateLimiter.consume(`ai_${this.userId}`, 1)
    } catch (rateLimitError) {
      throw new Error('AI rate limit exceeded. Please try again in 15 minutes.')
    }

    // Sanitize input
    const sanitizedRequirements = sanitizeInput(requirements)
    
    // Try providers in priority order
    for (const provider of AI_PROVIDERS) {
      try {
        console.log(`Trying ${provider.name}...`)
        const result = await this.tryProvider(provider, sanitizedRequirements, projectType)
        
        if (result && this.validateOutput(result)) {
          console.log(`Success with ${provider.name}`)
          return this.postProcessOutput(result)
        }
      } catch (error) {
        console.warn(`${provider.name} failed:`, error.message)
        continue
      }
    }

    throw new Error('All AI providers are currently unavailable. Please try again later.')
  }

  async tryProvider(provider, requirements, projectType) {
    const systemPrompt = this.getSystemPrompt(projectType)
    const userPrompt = this.getUserPrompt(requirements, projectType)
    
    const result = await provider.call(userPrompt, systemPrompt)
    
    if (!result || result.length < 50) {
      throw new Error('Provider returned empty or insufficient response')
    }

    return result
  }

  getSystemPrompt(projectType) {
    const prompts = {
      fullstack: `You are an expert full-stack developer. Generate COMPLETE, PRODUCTION-READY code.
      
REQUIREMENTS:
1. Generate valid HTML, CSS, and JavaScript
2. Include proper error handling
3. Make it mobile-responsive
4. Use modern CSS (Flexbox/Grid)
5. Include security best practices
6. Add basic SEO meta tags
7. Ensure accessibility standards

OUTPUT FORMAT:
Return ONLY the complete HTML file with embedded CSS and JavaScript.
Do not include markdown formatting or explanations.`,

      ecommerce: `You are an expert e-commerce developer. Generate COMPLETE online store code.

SPECIFIC REQUIREMENTS:
1. Product listing grid
2. Shopping cart functionality
3. Checkout form with validation
4. Payment integration ready
5. Order confirmation
6. Mobile-first responsive design
7. Security headers and validation

OUTPUT: Complete HTML with all functionality.`,

      saas: `You are an expert SaaS developer. Generate COMPLETE web application code.

SPECIFIC REQUIREMENTS:
1. User authentication interface
2. Dashboard layout
3. Data tables/cards
4. Settings panel
5. Responsive admin interface
6. Modern component design
7. Professional styling

OUTPUT: Complete HTML with all UI components.`
    }

    return prompts[projectType] || prompts.fullstack
  }

  getUserPrompt(requirements, projectType) {
    return `Create a complete ${projectType} website with: ${requirements}

Generate the entire HTML file with:
- Modern, professional design
- Mobile-responsive layout
- Semantic HTML structure
- Embedded CSS and JavaScript
- Proper form handling if needed
- Clean, maintainable code
- Accessibility considerations

Return ONLY the HTML code without explanations.`
  }

  validateOutput(code) {
    if (!code || typeof code !== 'string') return false
    if (code.length < 100) return false
    if (!code.includes('<!DOCTYPE html>') && !code.includes('<html')) return false
    
    // Security validation
    if (code.includes('eval(') || code.includes('javascript:')) return false
    if (code.includes('<script') && !code.includes('</script>')) return false

    return true
  }

  postProcessOutput(code) {
    // Remove markdown code blocks
    let cleaned = code.replace(/```html|```/g, '').trim()
    
    // Security sanitization
    cleaned = sanitizeHTML(cleaned)
    
    // Ensure proper HTML structure
    if (!cleaned.includes('<!DOCTYPE html>')) {
      cleaned = `<!DOCTYPE html>\n${cleaned}`
    }
    
    if (!cleaned.includes('</html>')) {
      cleaned = `${cleaned}\n</html>`
    }

    return cleaned
  }
}
