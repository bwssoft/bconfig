"use server"

import { revalidatePath } from "next/cache"
import { IProfile } from "../definition"
import profileRepository from "../repository/mongodb/profile.repository"
import { auth } from "@/auth"

const repository = profileRepository

export async function createOneProfile(input: Omit<IProfile
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
  revalidatePath("/profile")
  revalidatePath("/configurator")
  revalidatePath("/configuration")
  return _input
}

export async function createManyProfile(input: Omit<IProfile
  , "id" | "created_at">[]) {
  await repository.createMany(input.map(i => ({ ...i, created_at: new Date(), id: crypto.randomUUID() })))
  revalidatePath("/profile")
  revalidatePath("/configurator")
  return input
}

export async function findOneProfile(input: Partial<IProfile>) {
  return await repository.findOne(input)
}

export async function updateOneProfileById(query: { id: string }, value: Omit<IProfile, "id" | "created_at" | "user_id">) {
  const result = await repository.updateOne(query, value)
  revalidatePath("/profile")
  revalidatePath("/configurator")
  return result
}

export async function deleteOneProfileById(query: { id: string }) {
  const result = await repository.deleteOne(query)
  revalidatePath("/profile")
  revalidatePath("/configurator")
  return result
}

export async function findAllProfile(input?: Partial<IProfile>): Promise<IProfile[]> {
  return await repository.findMany(input ?? {}) as IProfile[]
}


export async function findManyByName(input: string): Promise<IProfile[]> {
  const aggregate = await repository.aggregate([
    {
      $match: {
        name: {
          $regex: input,
          $options: "i"
        }
      }
    }
  ])
  return await aggregate.toArray() as IProfile[]
}

export async function findManyByModel(model: IProfile["model"]): Promise<IProfile[]> {
  return await repository.findMany({ model })
}

