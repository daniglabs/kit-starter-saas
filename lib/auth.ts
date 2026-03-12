import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

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
          role: user?.role
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log("[Auth] password check", { isValid });

        if (!isValid) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role
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
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};

