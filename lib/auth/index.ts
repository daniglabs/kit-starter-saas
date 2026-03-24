import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { logAction, organizationIdForUser } from "@/lib/audit";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Email y contraseña",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        console.log("[Auth] authorize called", {
          email,
          hasPassword: !!password
        });

        if (!email || !password) {
          console.log("[Auth] missing email or password");
          return null;
        }

        await connectDB();
        console.log("[Auth] DB connected");

        const user = await User.findOne({ email }).lean();
        console.log("[Auth] user from DB", {
          found: !!user,
          id: user?._id,
          userType: user?.userType
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log("[Auth] password check", { isValid });

        if (!isValid) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          userType: (user as any).userType ?? (user as any).role
        } as any;
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userType = (user as any).userType ?? (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).userType = token.userType ?? (token as any).role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  events: {
    async signIn({ user }) {
      const organizationId = await organizationIdForUser(user.id ?? undefined);
      await logAction({
        userId: user.id ?? null,
        organizationId,
        userEmail: user.email ?? "",
        userName: user.name ?? "",
        action: "login",
        entity: "auth",
        details: `Inicio de sesión (${user.email})`
      });
    },
    async signOut({ token }) {
      const email = (token as any)?.email ?? "";
      const name = (token as any)?.name ?? "";
      const sub = (token as any)?.sub ?? null;
      const organizationId = await organizationIdForUser(sub ?? undefined);
      await logAction({
        userId: sub,
        organizationId,
        userEmail: email,
        userName: name,
        action: "logout",
        entity: "auth",
        details: `Cierre de sesión (${email})`
      });
    }
  }
};
