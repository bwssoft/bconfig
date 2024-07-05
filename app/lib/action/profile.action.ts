"use server"

import { IProfile } from "../definition"
import profileRepository from "../repository/mongodb/profile.repository"

const repository = profileRepository

export async function createOneProfile(input: Omit<IProfile
  , "id" | "created_at">) {
  await repository.create({ ...input, created_at: new Date(), id: crypto.randomUUID() })
  return input
}

export async function createManyProfile(input: Omit<IProfile
  , "id" | "created_at">[]) {
  await repository.createMany(input.map(i => ({ ...i, created_at: new Date(), id: crypto.randomUUID() })))
  return input
}

export async function findOneProfile(input: Partial<IProfile>) {
  return await repository.findOne(input)
}

export async function updateOneProfileById(query: { id: string }, value: Omit<IProfile, "id" | "created_at">) {
  return await repository.updateOne(query, value)
}

export async function deleteOneProfileById(query: { id: string }) {
  return await repository.deleteOne(query)
}

export async function findAllProfile(): Promise<IProfile[]> {
  return await repository.findAll() as IProfile[]
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

