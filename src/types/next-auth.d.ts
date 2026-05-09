import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    backendToken?: string
    backendUser?: {
      id: number
      username: string
      email: string
      firstName: string
      lastName: string
      role: string
      imageUrl?: string
      provider?: string
    }
  }

  interface JWT {
    backendToken?: string
    backendUser?: Session['backendUser']
  }
}