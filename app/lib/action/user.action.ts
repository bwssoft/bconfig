'use server';

import userRepository from "../repository/mongodb/user.repository"

export async function findOneUser(email: string) {
  const user = await userRepository.findOne({ email })
  return user
}