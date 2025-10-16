import { NextResponse } from 'next/server'
import { supabase } from '@/lib/database'

export async function GET() {
  const checks = {
    database: false,
    ai_providers: {},
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }

  try {
    // Database health check
    const { data, error } = await supabase
      .from('projects')
      .select('count')
      .limit(1)
    
    checks.database = !error
  } catch (error) {
    checks.database = false
  }

  // AI providers health check (non-blocking)
  const providerChecks = await checkAIProviders()
  checks.ai_providers = providerChecks

  const allHealthy = checks.database && 
    Object.values(providerChecks).some(provider => provider.healthy)

  return NextResponse.json(checks, {
    status: allHealthy ? 200 : 503
  })
}

async function checkAIProviders() {
  const providers = [
    { name: 'Groq', url: 'https://api.groq.com/openai/v1/models' },
    { name: 'HuggingFace', url: 'https://api-inference.huggingface.co/models' }
  ]

  const results = {}
  
  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, {
        method: 'HEAD',
        timeout: 5000
      })
      results[provider.name] = {
        healthy: response.ok,
        status: response.status
      }
    } catch (error) {
      results[provider.name] = {
        healthy: false,
        error: error.message
      }
    }
  }

  return results
}
