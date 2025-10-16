import { rateLimiter, sanitizeInput } from './security.js'

// Free AI Providers with fallback order
const AI_PROVIDERS = [
  {
    name: 'Groq',
    model: 'llama3-70b-8192',
    call: callGroqAI,
    priority: 1,
    cost: 0
  },
  {
    name: 'HuggingFace',
    model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', 
    call: callHuggingFace,
    priority: 2,
    cost: 0
  },
  {
    name: 'OpenRouter',
    model: 'google/gemma-7b-it:free',
    call: callOpenRouter,
    priority: 3,
    cost: 0
  }
]

// Groq AI (Primary - Fast & Free)
async function callGroqAI(prompt, systemMessage) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      top_p: 0.9
    })
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content
}

// HuggingFace (Secondary)
async function callHuggingFace(prompt, systemMessage) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `${systemMessage}\n\nUser: ${prompt}\n\nAssistant:`,
        parameters: {
          max_new_tokens: 3000,
          temperature: 0.7,
          return_full_text: false,
          do_sample: true
        }
      })
    }
  )

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`)
  }

  const data = await response.json()
  return data[0]?.generated_text
}

// OpenRouter (Fallback)
async function callOpenRouter(prompt, systemMessage) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ai-builder.com',
      'X-Title': 'AI Website Builder'
    },
    body: JSON.stringify({
      model: 'google/gemma-7b-it:free',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    })
  })

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content
}
