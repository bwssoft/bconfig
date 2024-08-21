'use server';

import { auth, signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { updateOneUserByEmail } from './user.action';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logout() {
  try {
    const session = await auth()
    if (!session) return
    const email = session.user?.email
    if (!email) return
    await updateOneUserByEmail({ email }, { connected: false })
    await signOut({ redirect: false });
  } catch (error) {
    console.error("error", error)
    throw error;
  }
}