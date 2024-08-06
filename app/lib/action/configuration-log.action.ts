"use server"

import { revalidatePath } from "next/cache"
import { IConfigurationLog } from "../definition"
import configurationLogRepository from "../repository/mongodb/configuration-log.repository"

const repository = configurationLogRepository

export async function createOneConfigurationLog(input: Omit<IConfigurationLog
  , "created_at">) {
  await repository.create({
    ...input,
    created_at: new Date()
  })
  revalidatePath("/log")
  return input
}

export async function createManyConfigurationLog(input: Omit<IConfigurationLog
  , "created_at">[]) {
  await repository.createMany(input.map(i => ({
    ...i,
    created_at: new Date()
  })))
  revalidatePath("/log")
  return input
}

export async function findOneConfigurationLog(input: Partial<IConfigurationLog>) {
  return await repository.findOne(input)
}

export async function updateOneConfigurationLogById(query: { id: string }, value: Omit<IConfigurationLog, "id" | "created_at">) {
  const result = await repository.updateOne(query, value)
  revalidatePath("/log")
  return result
}

export async function deleteOneConfigurationLogById(query: { id: string }) {
  const result = await repository.deleteOne(query)
  revalidatePath("/log")
  return result
}

export async function findAllConfigurationLog(): Promise<IConfigurationLog[]> {
  return await repository.findAll() as IConfigurationLog[]
}



