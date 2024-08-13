import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname.startsWith("/login")
      const isAuthRoutes =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/auto-test") ||
        nextUrl.pathname.startsWith("/auto-test-log") ||
        nextUrl.pathname.startsWith("/configurator") ||
        nextUrl.pathname.startsWith("/configuration-log") ||
        nextUrl.pathname.startsWith("/profile")

      if (!isAuthRoutes && !isLoggedIn) return true

      if (isAuthRoutes && !isLoggedIn && !isLoginPage) return Response.redirect(new URL("/login", nextUrl))

      if (isLoggedIn && isLoginPage) return Response.redirect(new URL("/", nextUrl))
      return true;
    },
    jwt({ user, token }) {
      if (user) {
        token = Object.assign(token, { id: user.id })
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id)
      return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;