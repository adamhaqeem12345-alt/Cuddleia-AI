'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Generate() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    projectType: 'fullstack'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult(data)
      router.refresh() // Refresh dashboard to show new project
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Generate Website
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="My Awesome Website"
                value={formData.projectName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                value={formData.projectType}
                onChange={handleChange}
              >
                <option value="fullstack">Full-Stack Website</option>
                <option value="ecommerce">E-Commerce Store</option>
                <option value="saas">SaaS Application</option>
                <option value="portfolio">Portfolio Site</option>
                <option value="blog">Blog Platform</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Website Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="6"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="Describe the website you want to build in detail. Include features, design preferences, target audience, and any specific requirements..."
                value={formData.description}
                onChange={handleChange}
              />
              <p className="mt-1 text-sm text-gray-500">
                Be specific about features, design, and functionality for better results.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Website'}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                🎉 Website Generated Successfully!
              </h3>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      const blob = new Blob([result.project.html], { type: 'text/html' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${formData.projectName.replace(/\s+/g, '-')}.html`
                      a.click()
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Download HTML
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View in Dashboard
                  </button>
                </div>
                <div className="text-sm text-green-700">
                  <p>Generation time: {result.metrics.generation_time}ms</p>
                  <p>Project saved to your dashboard</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
