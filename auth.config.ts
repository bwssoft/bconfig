import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userType = auth?.user?.type;
      const isLoginPage = nextUrl.pathname.startsWith("/login");

      // Routes accessible by employees only
      const isAuthEmployeeRoutes =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/auto-test") ||
        nextUrl.pathname.startsWith("/auto-test-log") ||
        nextUrl.pathname.startsWith("/configurator") ||
        nextUrl.pathname === "/configuration-log" ||
        nextUrl.pathname.startsWith("/profile");

      // Routes accessible by clients only
      const isAuthClientRoutes =
        nextUrl.pathname === "/configuration"

      const isAuthRoutes = isAuthEmployeeRoutes || isAuthClientRoutes;

      // Redirect unauthenticated users trying to access auth routes
      if (!isAuthRoutes && !isLoggedIn) return true;

      if (isAuthRoutes && !isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn) {
        if (userType === "employee" && isAuthClientRoutes) {
          return Response.redirect(new URL("/", nextUrl));
        }
        if (userType === "client" && isAuthEmployeeRoutes) {
          return Response.redirect(new URL("/configuration", nextUrl));
        }
      }

      if (isLoggedIn && isLoginPage && userType === "employee") {
        return Response.redirect(new URL("/", nextUrl));
      } else if (isLoggedIn && isLoginPage && userType === "client") {
        return Response.redirect(new URL("/configuration", nextUrl));
      }

      return true;
    },
    jwt({ user, token }) {
      if (user) {
        token = Object.assign(token, { id: user.id, type: user.type });
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id);
      session.user.type = token.type as "external" | "client" | "employee";
      return session;
    }
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
