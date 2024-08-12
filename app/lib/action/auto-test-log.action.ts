"use server"

import { revalidatePath } from "next/cache"
import { IAutoTestLog } from "../definition"
import autoTestLogRepository from "../repository/mongodb/auto-test-log.repository"

const repository = autoTestLogRepository

export async function createOneAutoTestLog(input: Omit<IAutoTestLog
  , "created_at">) {
  await repository.create({
    ...input,
    created_at: new Date()
  })
  revalidatePath("/log")
  return input
}

export async function createManyAutoTestLog(input: Omit<IAutoTestLog
  , "created_at">[]) {
  await repository.createMany(input.map(i => ({
    ...i,
    created_at: new Date()
  })))
  revalidatePath("/log")
  return input
}

export async function findOneAutoTestLog(input: Partial<IAutoTestLog>) {
  return await repository.findOne(input)
}

export async function updateOneAutoTestLogById(query: { id: string }, value: Omit<IAutoTestLog, "id" | "created_at">) {
  const result = await repository.updateOne(query, value)
  revalidatePath("/log")
  return result
}

export async function deleteOneAutoTestLogById(query: { id: string }) {
  const result = await repository.deleteOne(query)
  revalidatePath("/log")
  return result
}

export async function findAllAutoTestLog(): Promise<IAutoTestLog[]> {
  const aggregate = await repository.aggregate([
    { $match: {} },
    { $project: { _id: 0 } }
  ])
  return await aggregate.toArray() as IAutoTestLog[]
}



