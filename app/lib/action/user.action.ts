'use server';

import { IUser } from "../definition";
import userRepository from "../repository/mongodb/user.repository"
import { revalidatePath } from "next/cache"

const repository = userRepository

export async function findOneUser(props: { email: string, connected?: boolean }) {
  const user = await repository.findOne(props)
  return user
}

export async function findAllUsers(input?: Partial<IUser>): Promise<IUser[]> {
  return await repository.findMany(input ?? {}) as IUser[]
}

export async function updateOneUserById(query: { id: string }, value: Omit<IUser, "id" | "created_at">) {
  const result = await repository.updateOne(query, value)
  return result
}


export async function updateOneUserByEmail(query: { email: string }, value: Partial<Omit<IUser, "id" | "created_at">>) {
  const result = await repository.updateOne(query, value)
  return result
}

export async function deleteOneUserById(query: { id: string }) {
  const result = await repository.deleteOne(query)
  revalidatePath("/user")
  revalidatePath("/configurator")
  return result
}
