import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Production AI Website Builder',
  description: 'Enterprise-grade AI website builder',
  keywords: 'AI, website builder, full-stack, production',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
