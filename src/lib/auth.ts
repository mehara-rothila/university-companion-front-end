import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

          const names = user.name?.split(' ') || ['', '']
          const firstName = names[0] || ''
          const lastName = names.slice(1).join(' ') || ''

          const response = await fetch(`${apiUrl}/api/auth/oauth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              firstName: firstName,
              lastName: lastName,
              provider: 'google',
              providerId: account.providerAccountId,
              imageUrl: user.image,
              accessToken: account.id_token,
              role: 'STUDENT'
            }),
          })

          if (response.ok) {
            const backendUser = await response.json()
            token.backendUser = backendUser
            token.backendToken = backendUser.accessToken
          } else {
            console.error('Failed to register OAuth user with backend')
          }
        } catch (error) {
          console.error('Error calling backend OAuth endpoint:', error)
        }

        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      if (token.backendUser) {
        session.backendUser = token.backendUser as any
      }
      if (token.backendToken) {
        session.backendToken = token.backendToken as string
      }
      return session
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
