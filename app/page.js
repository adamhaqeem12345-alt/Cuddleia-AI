import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-white text-2xl font-bold">
              AI Website Builder
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-white hover:text-gray-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Build Production Websites
            <br />
            <span className="text-yellow-300">with AI</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Enterprise-grade AI website builder. Generate full-stack applications 
            with authentication, databases, and deployment in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/generate"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
              >
                Create New Project
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors"
              >
                Start Building Free
              </Link>
            )}
            <Link
              href="#features"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for production websites
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Full-Stack Generation"
              description="Complete HTML, CSS, JavaScript with backend integrations and database design"
              icon="🚀"
            />
            <FeatureCard
              title="Production Security"
              description="Row-level security, rate limiting, input sanitization, and authentication"
              icon="🔒"
            />
            <FeatureCard
              title="Multi-AI Providers"
              description="Fallback AI systems ensure 99.9% uptime and consistent quality"
              icon="🤖"
            />
            <FeatureCard
              title="Project Management"
              description="Organize, download, and manage all your generated projects"
              icon="📁"
            />
            <FeatureCard
              title="Analytics & Monitoring"
              description="Track usage, performance, and generation metrics"
              icon="📊"
            />
            <FeatureCard
              title="Free Forever"
              description="No hidden costs. Free AI providers and hosting"
              icon="💸"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers building production websites with AI
          </p>
          <Link
            href={session ? "/generate" : "/auth/register"}
            className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors inline-block"
          >
            Start Building Free
          </Link>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
