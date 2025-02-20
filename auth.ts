import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { IUser } from '@/app/lib/definition';
import bcrypt from 'bcrypt';
import { findOneUser, updateOneUserById } from './app/lib/action';

async function getUser(email: string): Promise<IUser | null> {
  try {
    const user = await findOneUser({ email });
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          if (user.type === "external" && user.connected) return null
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            const { password, ...restUser } = user
            await updateOneUserById({ id: user.id }, { ...restUser, connected: true })
            return user
          };
        }

        return null;
      },
    }),
  ],
});