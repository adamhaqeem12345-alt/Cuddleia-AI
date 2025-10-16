import { NextAuth } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from './database.js'
import bcrypt from 'bcryptjs'
import { sanitizeInput } from './security.js'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        const email = sanitizeInput(credentials.email)
        
        // Get user from database
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single()

        if (error || !user) {
          throw new Error('Invalid credentials')
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!isValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.sub
      session.user.role = token.role
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
}

export default NextAuth(authOptions)
