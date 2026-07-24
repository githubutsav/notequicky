import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is available — embed the DB id into the token
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      // Expose the DB user id on the session object for server actions
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

