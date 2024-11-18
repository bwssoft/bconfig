'use server';

import { auth } from "@/auth";
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

export async function createOneUser(input: Omit<IUser
  , "id" | "created_at" | "user_id">) {
  const session = await auth()
  const created_at = new Date()
  const id = crypto.randomUUID()
  const _input = {
    ...input,
    created_at,
    id,
    user_id: session?.user.id!
  }
  await repository.create(_input)
  revalidatePath("/user")
  revalidatePath("/configurator")
  revalidatePath("/configuration")
  return _input
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
