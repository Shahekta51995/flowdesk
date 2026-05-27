import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode"; 

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Keycloak Backend",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          // Construct Keycloak standard token endpoint URL
          const tokenUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
          const params = new URLSearchParams();
          params.append("grant_type", "password");
          params.append("client_id", process.env.KEYCLOAK_ID!);
          if (process.env.KEYCLOAK_SECRET) {
            params.append("client_secret", process.env.KEYCLOAK_SECRET);
          }
          params.append("username", credentials.username as string);
          params.append("password", credentials.password as string);

          const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
          });

          const data = await res.json();

          if (!res.ok || !data.access_token) {
            return null; // Triggers sign-in failure
          }

          // Decode access token to pull profiles and roles
          const decoded: any = jwtDecode(data.access_token);
          const roles = decoded?.realm_access?.roles || [];

          return {
            id: decoded.sub,
            name: decoded.name || decoded.preferred_username,
            email: decoded.email,
            accessToken: data.access_token,
            roles: roles,
            isAdmin: roles.includes("admin"),
          };
        } catch (error) {
          console.error("Keycloak authorization error:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.roles = (user as any).roles;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.roles = token.roles as string[];
      session.user.isAdmin = token.isAdmin as boolean;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});